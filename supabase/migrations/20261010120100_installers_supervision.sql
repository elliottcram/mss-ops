-- =====================================================================
-- Installer onboarding, operatives, credentials and MCS supervision.
-- Sources: MCS Guidance for the Supervision of Installation Work 1.0,
-- MSS P11, P20, P21, P31, F05, F05A.
-- =====================================================================

create type operative_level   as enum ('skilled_qualified', 'skilled', 'supervised');
create type risk_level        as enum ('low', 'medium', 'high');
create type supervision_colour as enum ('green', 'amber', 'red');

-- ---------- installer onboarding (done once per installer) -----------
alter table installers
  add column company_number              text,
  add column address_id                  uuid references addresses(id),
  add column onboarding_started_on       date,
  add column easymcs_subcontractor_on    date,      -- set up as subcontractor on Easy MCS
  add column f05_signed_on               date,      -- Subcontractor Agreement
  add column supplies_technical_supervisor boolean not null default false,
  add column f05a_signed_on              date,      -- TS Agreement, only if they supply a TS
  add column public_liability_expires_on date,
  add column employers_liability_expires_on date,
  add column calibration_expires_on      date,      -- R04 tool calibration
  add column r09_approved_on             date,      -- added to R09 Approved Subcontractors
  add column notes                       text;

-- ---------- operatives ----------------------------------------------
create table operatives (
  id                      uuid primary key default gen_random_uuid(),
  installer_id            uuid references installers(id),   -- null = MSS's own staff
  staff_id                uuid references staff(id),
  name                    text not null,
  email                   text,
  phone                   text,
  contract_with_mss_on    date,                    -- credentials register: date of contract
  easymcs_setup_on        date,                    -- operative set up on Easy MCS
  r07_received_on         date,                    -- skills and training matrix
  is_technical_supervisor boolean not null default false,
  ts_assessed_on          date,                    -- TS reassessed every 5 years
  active                  boolean not null default true
);
create index on operatives (installer_id);

create table credential_types (
  code        text primary key,
  label       text not null,
  has_expiry  boolean not null default false,
  -- Unvented / water regs are separate competencies: they never change the level.
  affects_level boolean not null default true,
  note        text
);

create table operative_credentials (
  id                   uuid primary key default gen_random_uuid(),
  operative_id         uuid not null references operatives(id) on delete cascade,
  credential_type_code text not null references credential_types(code),
  technology           technology,          -- null = applies to every technology
  reference            text,
  issued_on            date,
  expires_on           date,
  file_url             text,
  verified_by          uuid references staff(id),
  verified_at          timestamptz
);
create index on operative_credentials (operative_id);

-- Which credentials make which level. A level is met when EVERY rule_group
-- for it has at least one in-date credential. (CHECK against Easy MCS.)
create table level_rules (
  level                operative_level not null,
  technology           technology not null,
  rule_group           text not null,
  credential_type_code text not null references credential_types(code),
  primary key (level, technology, rule_group, credential_type_code)
);

-- The level actually used, as set in Easy MCS. The app suggests one from
-- credentials (operative_level_check) and flags any difference.
create table operative_levels (
  operative_id uuid not null references operatives(id) on delete cascade,
  technology   technology not null,
  level        operative_level not null,
  set_on       date not null default current_date,
  note         text,
  primary key (operative_id, technology)
);

create view operative_level_check with (security_invoker = true) as
with valid as (
  select oc.operative_id, oc.credential_type_code, oc.technology
  from operative_credentials oc
  where oc.expires_on is null or oc.expires_on >= current_date
),
met as (
  select o.id as operative_id, t.technology, lr.level
  from operatives o
  cross join (select unnest(enum_range(null::technology)) as technology) t
  join level_rules lr on lr.technology = t.technology
  group by o.id, t.technology, lr.level
  having bool_and(exists (
    select 1 from valid v join level_rules lr2
      on lr2.credential_type_code = v.credential_type_code
     and lr2.level = lr.level and lr2.technology = t.technology
    where v.operative_id = o.id
      and (v.technology is null or v.technology = t.technology)
      and lr2.rule_group = lr.rule_group))
)
select ol.operative_id, ol.technology, ol.level as recorded_level,
       coalesce((select m.level from met m
                  where m.operative_id = ol.operative_id and m.technology = ol.technology
                  order by m.level limit 1), 'supervised') as suggested_level,
       ol.level is distinct from coalesce((select m.level from met m
                  where m.operative_id = ol.operative_id and m.technology = ol.technology
                  order by m.level limit 1), 'supervised') as differs
from operative_levels ol;

-- Credentials expiring soon (register reminder) or expired.
create view credential_expiry with (security_invoker = true) as
select oc.id, o.installer_id, o.id as operative_id, o.name as operative_name,
       ct.label, oc.expires_on,
       (oc.expires_on < current_date) as expired,
       (oc.expires_on - current_date) as days_left
from operative_credentials oc
join operatives o on o.id = oc.operative_id
join credential_types ct on ct.code = oc.credential_type_code
where oc.expires_on is not null;

-- What's still missing before an installer counts as onboarded.
create view installer_onboarding with (security_invoker = true) as
select i.id as installer_id, i.name,
       array_remove(array[
         case when i.email is null or i.contact_name is null then 'Company contact and email' end,
         case when i.easymcs_subcontractor_on is null then 'Set up as subcontractor on Easy MCS' end,
         case when i.default_manufacturer_id is null then 'Default heat pump manufacturer' end,
         case when i.f05_signed_on is null then 'Signed F05 Subcontractor Agreement' end,
         case when i.supplies_technical_supervisor and i.f05a_signed_on is null then 'Signed F05A Technical Supervisor Agreement' end,
         case when i.public_liability_expires_on is null or i.public_liability_expires_on < current_date then 'Current public liability insurance' end,
         case when i.employers_liability_expires_on is null or i.employers_liability_expires_on < current_date then 'Current employers liability insurance' end,
         case when i.calibration_expires_on is null or i.calibration_expires_on < current_date then 'Tool calibration certificates (R04)' end,
         case when i.r09_approved_on is null then 'Added to R09 Approved Subcontractors' end,
         case when not exists (select 1 from operatives o where o.installer_id = i.id and o.active)
              then 'At least one operative' end,
         case when exists (select 1 from operatives o where o.installer_id = i.id and o.active
                             and (o.easymcs_setup_on is null or o.r07_received_on is null
                                  or not exists (select 1 from operative_levels l where l.operative_id = o.id)))
              then 'Every operative set up on Easy MCS with an R07 and a level' end,
         case when exists (select 1 from credential_expiry ce where ce.installer_id = i.id and ce.expired)
              then 'Expired qualification' end
       ], null) as missing
from installers i;

-- ---------- supervision on the job ----------------------------------
create table supervision_matrix (
  level  operative_level not null,
  risk   risk_level not null,
  colour supervision_colour not null,
  primary key (level, risk)
);

alter table jobs
  add column risk_level             risk_level,
  add column risk_reasoning         text,
  add column supervision_approach   text,
  add column technical_supervisor_id uuid references operatives(id);

create table job_operatives (
  job_id       uuid not null references jobs(id) on delete cascade,
  operative_id uuid not null references operatives(id),
  is_lead      boolean not null default false,
  primary key (job_id, operative_id)
);
-- One lead per job: the job takes the lead operative's level (CHECK with Elliott).
create unique index job_one_lead on job_operatives (job_id) where is_lead;

create view job_supervision with (security_invoker = true) as
select j.id as job_id, j.risk_level, lead.operative_id as lead_operative_id,
       lvl.level as lead_level, sm.colour,
       -- Supervised operatives must have a skilled or S&Q operative on site.
       (exists (select 1 from job_operatives jo join operative_levels l
                  on l.operative_id = jo.operative_id and l.technology = j.technology
                 where jo.job_id = j.id and l.level = 'supervised')
        and not exists (select 1 from job_operatives jo join operative_levels l
                  on l.operative_id = jo.operative_id and l.technology = j.technology
                 where jo.job_id = j.id and l.level <> 'supervised')) as supervised_without_skilled
from jobs j
left join job_operatives lead on lead.job_id = j.id and lead.is_lead
left join operative_levels lvl on lvl.operative_id = lead.operative_id and lvl.technology = j.technology
left join supervision_matrix sm on sm.level = lvl.level and sm.risk = j.risk_level;

create trigger log_job_operatives after insert or update or delete on job_operatives
  for each row execute function log_change();
create trigger log_operative_credentials after insert or update or delete on operative_credentials
  for each row execute function log_change();
