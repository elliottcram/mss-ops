-- =====================================================================
-- Stages 3 to 10: spec versions, money, HIES / DNO / BUS, milestones,
-- photo checkpoints, remedials, chase rules, complaints, non-conformities.
-- =====================================================================

-- ---------- milestones: dated ticks driven by a catalogue ------------
create table milestone_types (
  code       text primary key,
  label      text not null,
  stage      job_stage not null,
  sort_order int not null default 100,
  note       text
);

create table job_milestones (
  id             uuid primary key default gen_random_uuid(),
  job_id         uuid not null references jobs(id) on delete cascade,
  milestone_code text not null references milestone_types(code),
  done_on        date not null default current_date,
  reference      text,          -- e.g. MCS certificate number, NAPIT reference
  file_url       text,
  note           text,
  recorded_at    timestamptz not null default now(),
  unique (job_id, milestone_code)
);
create index on job_milestones (job_id);
create trigger log_job_milestones after insert or update or delete on job_milestones
  for each row execute function log_change();

create function milestone_on(p_job uuid, p_code text) returns date
language sql stable as $$
  select done_on from job_milestones where job_id = p_job and milestone_code = p_code
$$;

-- Stage 9 order: HIES completion, then NAPIT, then MCS certificate.
create function trg_certificate_order() returns trigger language plpgsql as $$
begin
  if new.milestone_code = 'napit_notified'
     and (select completion_entered_on from hies_registrations where job_id = new.job_id) is null then
    raise exception 'Enter the HIES completion before the NAPIT notification';
  end if;
  if new.milestone_code = 'mcs_certificate_issued'
     and milestone_on(new.job_id, 'napit_notified') is null then
    raise exception 'Do the NAPIT notification before issuing the MCS certificate';
  end if;
  return new;
end $$;
create trigger certificate_order before insert or update on job_milestones
  for each row execute function trg_certificate_order();

-- ---------- spec versions and approvals (stage 4) --------------------
create table spec_versions (
  id                    uuid primary key default gen_random_uuid(),
  job_id                uuid not null references jobs(id) on delete cascade,
  version               int not null,
  heat_loss_pdf_url     text,
  sent_on               date,
  installer_approved_at timestamptz,
  installer_evidence    text,       -- email or link click
  homeowner_approved_at timestamptz,
  homeowner_evidence    text,
  changes_requested     text,
  created_at            timestamptz not null default now(),
  unique (job_id, version)
);
create trigger log_spec_versions after insert or update or delete on spec_versions
  for each row execute function log_change();

create view job_current_spec with (security_invoker = true) as
select distinct on (job_id) *,
       (installer_approved_at is not null and homeowner_approved_at is not null) as approved
from spec_versions
order by job_id, version desc;

-- ---------- quote, contract and money (stage 5) ----------------------
alter table jobs
  add column quote_ref                 text,
  add column quote_date                date,
  add column quote_total_before_grant  numeric(10,2),   -- total installation cost
  add column bus_grant_amount          numeric(10,2),
  add column heat_pump_cost            numeric(10,2),   -- cost of the heat pump to the customer
  add column contract_value            numeric(10,2),   -- what the homeowner pays (after grant)
  add column express_consent_signed_on date,            -- F08B: work may start inside cooling-off
  add column planned_install_start     date,
  add column planned_install_finish    date,
  add constraint grant_deducted check
    (contract_value is null or quote_total_before_grant is null or bus_grant_amount is null
     or contract_value = quote_total_before_grant - bus_grant_amount);

-- Installer's price for a spec version (form or uploaded quote).
create table installer_prices (
  id              uuid primary key default gen_random_uuid(),
  job_id          uuid not null references jobs(id) on delete cascade,
  spec_version_id uuid references spec_versions(id),
  received_on     date not null default current_date,
  method          text not null check (method in ('form','upload')),
  total           numeric(10,2),
  heat_pump_cost  numeric(10,2),
  file_url        text,
  checked_by      uuid references staff(id)
);

-- Homeowner payments: the contract's schedule plus what actually arrived.
create table job_payments (
  id          uuid primary key default gen_random_uuid(),
  job_id      uuid not null references jobs(id) on delete cascade,
  kind        text not null check (kind in ('deposit','stage','final','other')),
  label       text,
  amount_due  numeric(10,2) not null check (amount_due >= 0),
  due_on      date,
  in_contract boolean not null default true,     -- false = not in the signed schedule (flagged)
  paid_amount numeric(10,2),
  paid_on     date,
  note        text,
  check ((paid_amount is null) = (paid_on is null))
);
create index on job_payments (job_id);
create trigger log_job_payments after insert or update or delete on job_payments
  for each row execute function log_change();

-- Next Tuesday or Friday payment run strictly after the given day.
-- Days come from settings 'payment_run_days' (ISO: 1 = Mon ... 7 = Sun).
create function next_payment_run(p_from date) returns date language sql stable as $$
  select min(d)::date
  from generate_series(p_from + 1, p_from + 7, interval '1 day') d
  where extract(isodow from d)::int = any (
    string_to_array((select value from settings where key = 'payment_run_days'), ',')::int[])
$$;

create table installer_payouts (
  id                 uuid primary key default gen_random_uuid(),
  job_id             uuid not null references jobs(id) on delete cascade,
  installer_id       uuid not null references installers(id),
  job_payment_id     uuid references job_payments(id),   -- the homeowner payment it follows
  amount             numeric(10,2) not null,
  paid_on            date,
  reference          text
);
create trigger log_installer_payouts after insert or update or delete on installer_payouts
  for each row execute function log_change();

create view installer_payouts_due with (security_invoker = true) as
select p.*, jp.paid_on as homeowner_paid_on,
       case when jp.paid_on is not null then next_payment_run(jp.paid_on) end as payment_run
from installer_payouts p
left join job_payments jp on jp.id = p.job_payment_id
where p.paid_on is null;

create view job_money with (security_invoker = true) as
select j.id as job_id, j.contract_value,
       coalesce(sum(p.amount_due) filter (where p.in_contract), 0)     as scheduled_total,
       coalesce(sum(p.paid_amount), 0)                                 as paid_total,
       -- HIES protects deposits/stage payments up to the lower of 25% or GBP 5,000
       least(j.contract_value * (select value::numeric from settings where key = 'hies_deposit_cover_pct') / 100,
             (select value::numeric from settings where key = 'hies_deposit_cover_cap')) as deposit_cover_limit,
       -- Deposit and stage payments taken before completion (what HIES covers)
       coalesce(sum(p.amount_due) filter (where p.in_contract and p.kind in ('deposit','stage')), 0)
                                                                       as upfront_total,
       count(*) filter (where p.paid_on is null and p.due_on < current_date) as overdue_payments,
       count(*) filter (where p.paid_on is not null and (p.paid_amount <> p.amount_due
                          or p.paid_on > p.due_on or not p.in_contract)) as mismatched_payments,
       bool_and(p.paid_on is not null) filter (where p.in_contract)   as all_paid
from jobs j
left join job_payments p on p.job_id = j.id
group by j.id, j.contract_value;

-- ---------- stage 6: HIES, DNO, BUS ---------------------------------
create table hies_registrations (
  job_id                    uuid primary key references jobs(id) on delete cascade,
  reference                 text,
  registered_on             date,
  deposit_amount            numeric(10,2),
  deposit_paid_on           date,
  completion_entered_on     date,     -- within 7 days of completion (H2.5)
  guarantee_sent_on         date      -- workmanship guarantee within 7 days (H2.1)
);
create trigger log_hies after insert or update or delete on hies_registrations
  for each row execute function log_change();

create table dno_applications (
  id                         uuid primary key default gen_random_uuid(),
  job_id                     uuid not null references jobs(id) on delete cascade,
  reference                  text,
  application_type           text check (application_type in ('connect_and_notify','apply_to_connect')),
  -- Where ENA / the DNO says approval is needed before connection, the install waits too.
  approval_needed_before_install boolean not null default false,
  submitted_on               date,
  passed_to_dno_on           date,
  approved_on                date,     -- approved, or DNO confirms we can connect
  withdrawn_on               date,
  notes                      text
);
create index on dno_applications (job_id);
create trigger log_dno after insert or update or delete on dno_applications
  for each row execute function log_change();

create table bus_applications (
  id                      uuid primary key default gen_random_uuid(),
  job_id                  uuid not null references jobs(id) on delete cascade,
  reference               text,
  -- Figures submitted to Ofgem: must match the quote.
  submitted_total_before_grant numeric(10,2),
  submitted_grant         numeric(10,2),
  submitted_heat_pump_cost numeric(10,2),
  submitted_quote_ref     text,
  submitted_quote_date    date,
  applied_on              date,
  assisted_digital        boolean not null default false,  -- 28-day consent route
  consent_requested_on    date,      -- Ofgem emails the homeowner
  consent_given_on        date,
  info_requested_on       date,
  info_responded_on       date,
  voucher_id              text,
  voucher_issued_on       date,
  voucher_expires_on      date,      -- 3 months for air source; filled by trigger if blank
  redeemed_on             date,
  redeemed_amount         numeric(10,2),
  rejected_on             date,
  withdrawn_on            date
);
create index on bus_applications (job_id);
create trigger log_bus after insert or update or delete on bus_applications
  for each row execute function log_change();

create function trg_voucher_expiry() returns trigger language plpgsql as $$
begin
  if new.voucher_issued_on is not null and new.voucher_expires_on is null then
    new.voucher_expires_on := (new.voucher_issued_on
      + make_interval(months => (select value::int from settings where key = 'bus_voucher_months')))::date;
  end if;
  return new;
end $$;
create trigger voucher_expiry before insert or update on bus_applications
  for each row execute function trg_voucher_expiry();

-- Latest live (not withdrawn/rejected) application per job.
create view job_bus with (security_invoker = true) as
select distinct on (b.job_id) b.*,
       (b.submitted_total_before_grant is distinct from j.quote_total_before_grant
        or b.submitted_grant          is distinct from j.bus_grant_amount
        or b.submitted_heat_pump_cost is distinct from j.heat_pump_cost
        or b.submitted_quote_ref      is distinct from j.quote_ref
        or b.submitted_quote_date     is distinct from j.quote_date) as figures_differ_from_quote
from bus_applications b join jobs j on j.id = b.job_id
where b.withdrawn_on is null and b.rejected_on is null
order by b.job_id, b.applied_on desc nulls last;

create view job_dno with (security_invoker = true) as
select distinct on (job_id) *
from dno_applications where withdrawn_on is null
order by job_id, submitted_on desc nulls last;

-- ---------- stage 7: photo checkpoints and remedials ----------------
create table checkpoint_types (
  code         text primary key,
  label        text not null,
  what_to_photograph text,
  install_stage text,
  -- Which supervision colours must send it: green jobs send the fewest.
  required_for supervision_colour[] not null default '{green,amber,red}',
  audit_item   boolean not null default false,  -- picked up in past MCS audits
  sort_order   int not null default 100
);

create table job_checkpoint_photos (
  id              uuid primary key default gen_random_uuid(),
  job_id          uuid not null references jobs(id) on delete cascade,
  checkpoint_code text not null references checkpoint_types(code),
  photo_url       text not null,
  taken_at        timestamptz,
  latitude        numeric(9,6),
  longitude       numeric(9,6),
  uploaded_by     text,
  review_status   text not null default 'pending' check (review_status in ('pending','accepted','rejected')),
  reviewed_by     uuid references staff(id),
  review_note     text,
  uploaded_at     timestamptz not null default now()
);
create index on job_checkpoint_photos (job_id);
create trigger log_checkpoint_photos after insert or update or delete on job_checkpoint_photos
  for each row execute function log_change();

create table remedials (
  id           uuid primary key default gen_random_uuid(),
  job_id       uuid not null references jobs(id) on delete cascade,
  raised_on    date not null default current_date,
  raised_from  text check (raised_from in ('checkpoint','commissioning','handover','complaint','other')),
  description  text not null,
  photo_url    text,            -- installer's evidence of the fix
  accepted_on  date,
  accepted_by  uuid references staff(id),
  rejected_note text
);
create index on remedials (job_id);
create trigger log_remedials after insert or update or delete on remedials
  for each row execute function log_change();

-- Required checkpoints for the job's colour, and whether each is accepted.
create view job_checkpoint_status with (security_invoker = true) as
select js.job_id, ct.code, ct.label, ct.sort_order,
       exists (select 1 from job_checkpoint_photos p where p.job_id = js.job_id
                 and p.checkpoint_code = ct.code and p.review_status = 'accepted') as accepted,
       exists (select 1 from job_checkpoint_photos p where p.job_id = js.job_id
                 and p.checkpoint_code = ct.code) as submitted
from job_supervision js
join checkpoint_types ct on js.colour = any (ct.required_for);

-- ---------- chase rules (settings, not code) -------------------------
create table chase_rules (
  code             text primary key,
  plan_ref         int,              -- row number in the plan's chasing table
  label            text not null,
  stage            job_stage,
  chase_party      party_role,       -- null = internal alert only
  clock_event      text not null,    -- milestone code or event that starts the clock
  start_offset_days int,             -- negative = before (e.g. before a due date)
  repeat_every_days int,             -- null = once
  escalate_after_days int,
  escalate_to      text check (escalate_to in ('assignee','office_lead','admin')),
  sends_email      boolean not null default true,  -- false = warns MSS staff only
  only_when        text,             -- condition in words, e.g. "installer has live jobs"
  active           boolean not null default true,
  note             text
);

-- ---------- complaints and non-conformities --------------------------
create table bank_holidays (
  day  date primary key,
  name text not null
);

create function add_working_days(p_from date, p_days int) returns date
language plpgsql stable as $$
declare d date := p_from; n int := 0;
begin
  while n < p_days loop
    d := d + 1;
    if extract(isodow from d) < 6 and not exists (select 1 from bank_holidays where day = d) then
      n := n + 1;
    end if;
  end loop;
  return d;
end $$;

create table complaints (
  id                     uuid primary key default gen_random_uuid(),
  job_id                 uuid references jobs(id),
  installer_id           uuid references installers(id),
  received_at            timestamptz not null default now(),
  complainant_name       text not null,
  complainant_contact    text,
  complaint              text not null,
  no_heat_or_hot_water   boolean not null default false,  -- visit within 24 hours
  subcontractor_involved boolean,
  handler_id             uuid references staff(id),
  acknowledged_on        date,
  visited_on             date,
  response_sent_on       date,
  new_response_date      date,          -- if 13 working days can't be met, tell them why
  root_cause             text,
  action_taken           text,
  preventive_action      text,
  outcome                text,
  resolved_on            date
);
create trigger log_complaints after insert or update or delete on complaints
  for each row execute function log_change();

create view complaint_deadlines with (security_invoker = true) as
select c.id, c.job_id,
       add_working_days(c.received_at::date, 2)  as acknowledge_by,
       case when c.no_heat_or_hot_water then c.received_at + interval '24 hours'
            else c.received_at + interval '7 days' end as visit_by,
       coalesce(c.new_response_date, add_working_days(c.received_at::date, 13)) as respond_by
from complaints c;

create table nonconformities (
  id                 uuid primary key default gen_random_uuid(),
  raised_on          date not null default current_date,
  source             text not null check (source in ('mcs_assessment','internal_audit','ofgem_audit','other')),
  job_id             uuid references jobs(id),
  description        text not null,
  clause             text,
  root_cause         text,
  action_plan        text,
  plan_sent_on       date,         -- to the Certification Body, within 6 weeks (P03)
  could_be_systemic  boolean,
  closed_on          date
);

create view nonconformity_deadlines with (security_invoker = true) as
select n.id, n.raised_on + 42 as plan_due_on,
       (n.plan_sent_on is null and current_date > n.raised_on + 42) as overdue
from nonconformities n;
