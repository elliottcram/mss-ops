-- =====================================================================
-- MSS operations tool: core schema (PostgreSQL 15+, Supabase)
-- Jobs, requirements catalogue, survey, sound assessment, audit log.
--
-- Principles
--  * Requirements, chase rules, milestones and settings are DATA, not code.
--  * Everything on intake is optional except job_ref; gaps are computed.
--  * Sound maths follows MCS 020 a) Issue 1.1 and is tested against the
--    MCS calculator workbook (see supabase/tests).
--  * Every change is logged with who/what made it (people, bots, links).
-- =====================================================================

-- ---------- enums ----------------------------------------------------
create type job_type      as enum ('retrofit', 'new_build');
-- The 10 stages of the plan, plus stage 0 and closed.
create type job_stage     as enum ('enquiry',       -- 0 enquiry and quote
                                   'job_setup',     -- 1 setup and information gathering
                                   'survey',        -- 2 survey / drawings and short form
                                   'design',        -- 3 heat loss, spec and sound check
                                   'approval',      -- 4 installer and homeowner approval
                                   'contract',      -- 5 pricing, proposal, contract, invoice
                                   'applications',  -- 6 HIES, DNO, BUS
                                   'installation',  -- 7 ready to install, install
                                   'commissioning', -- 8 commissioning and remedials
                                   'certification', -- 9 certificates and notifications
                                   'closing',       -- 10 BUS redemption, payments, handover
                                   'closed');
create type technology    as enum ('air_source_heat_pump','ground_source_heat_pump',
                                   'solar_pv','battery_storage','solar_thermal');
create type req_kind      as enum ('data', 'document', 'form');
create type party_role    as enum ('installer','homeowner','main_contractor','surveyor','internal');
-- Each gate is a yes/no "can this happen yet?" question.
create type gate          as enum ('setup_complete',   -- stage 1 -> 2
                                   'heat_loss',        -- ready for heat loss
                                   'send_spec',        -- spec can go to installer + homeowner
                                   'contract',         -- proposal pack + contract can be sent
                                   'dno',              -- DNO application can be submitted
                                   'bus_application',  -- BUS application can be submitted
                                   'ready_to_install', -- stage 7
                                   'switch_on',        -- heat pump may be switched on
                                   'certification',    -- MCS certificate may be issued
                                   'close');           -- job may close
create type req_condition as enum ('always', 'id_check_failed');
create type req_status    as enum ('missing', 'requested', 'received', 'waived');
create type line_of_sight as enum ('no_view', 'partial_view', 'full_view');
create type barrier_class as enum ('type_1', 'type_2', 'none');
create type actor_kind    as enum ('staff', 'bot', 'external_link', 'system');
create type survey_status as enum ('draft', 'submitted');

-- ---------- generic helpers ------------------------------------------
create function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create table settings (
  key   text primary key,
  value text not null,
  note  text
);

-- ---------- people & organisations -----------------------------------
create table staff (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,            -- link to Supabase auth.users later
  name         text not null,
  email        text unique,
  role         text not null default 'office'
               check (role in ('admin','office','surveyor','heat_loss','engineer')),
  active       boolean not null default true
);

create table manufacturers (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table heat_pump_models (
  id               uuid primary key default gen_random_uuid(),
  manufacturer_id  uuid not null references manufacturers(id),
  model            text not null,
  output_kw        numeric(5,1),
  -- A-weighted SOUND POWER level, never sound pressure, never low-noise mode
  -- (MCS 020 a) step 3). Source: product fiche / energy label / MCS database.
  sound_power_db   numeric(4,1) not null check (sound_power_db > 0),
  sound_power_note text,
  active           boolean not null default true,
  unique (manufacturer_id, model)
);

create table installers (
  id                        uuid primary key default gen_random_uuid(),
  name                      text not null,
  contact_name              text,
  email                     text,
  phone                     text,
  default_manufacturer_id   uuid references manufacturers(id),
  active                    boolean not null default true
);

create table addresses (
  id                uuid primary key default gen_random_uuid(),
  line1             text,
  line2             text,
  town              text,
  county            text,
  postcode          text,        -- separate field; may be unknown for new-build plots
  plot_or_site_name text
);

-- ---------- jobs ------------------------------------------------------
create table jobs (
  id                          uuid primary key default gen_random_uuid(),
  job_ref                     text not null unique,
  crm_ref                     text,
  job_type                    job_type,
  stage                       job_stage not null default 'enquiry',
  technology                  technology not null default 'air_source_heat_pump',
  -- Whoever completes the heat loss: chases escalate to this person.
  assignee_id                 uuid references staff(id),

  -- Exceptions (any stage)
  on_hold_reason              text,
  on_hold_review_on           date,      -- reappears on the home screen this day
  cancelled_at                timestamptz,
  cancelled_reason            text,

  -- Stage 0 enquiry: whoever filled in the quote form
  enquiry_contact_role        party_role check (enquiry_contact_role in ('homeowner','installer')),
  enquiry_contact_name        text,
  enquiry_contact_email       text,
  enquiry_contact_phone       text,
  existing_heating_type       text,       -- tap choice, existing homes only
  preferred_cylinder_make     text,
  enquiry_notes               text,
  epc_expires_on              date,       -- looked up, not asked
  drive_folder_url            text,
  easymcs_project_ref         text,

  homeowner_name              text,
  homeowner_phone             text,
  homeowner_email             text,

  install_address_id          uuid references addresses(id),
  -- New build only: the address the homeowner's photo ID / bills match
  -- (Ofgem ID check). Never asked on retrofit.
  owner_residential_address_id uuid references addresses(id),

  installer_id                uuid references installers(id),
  main_contractor_name        text,      -- optional, new build
  main_contractor_email       text,
  manufacturer_id             uuid references manufacturers(id),  -- prefilled from installer, editable
  has_cylinder                boolean not null default true,      -- needs the F26 cylinder sheet
  uses_bus_grant              boolean not null default true,

  estimated_heat_loss_kw      numeric(5,1),
  estimated_unit_id           uuid references heat_pump_models(id),
  final_heat_loss_kw          numeric(5,1),
  final_unit_id               uuid references heat_pump_models(id),

  id_check_failed             boolean not null default false,

  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),

  constraint owner_address_new_build_only
    check (job_type is distinct from 'retrofit' or owner_residential_address_id is null),
  constraint cancel_needs_reason
    check (cancelled_at is null or cancelled_reason is not null),
  constraint hold_needs_review_date
    check (on_hold_reason is null or on_hold_review_on is not null)
);
create trigger jobs_updated_at before update on jobs
  for each row execute function set_updated_at();
create index on jobs (stage);
create index on jobs (assignee_id);

-- ---------- requirements catalogue -----------------------------------
create table requirements (
  id                   uuid primary key default gen_random_uuid(),
  code                 text not null unique,
  label                text not null,
  description          text,
  kind                 req_kind not null,
  job_type             job_type,                       -- null = every job type
  condition            req_condition not null default 'always',
  blocks_gate          gate,                           -- null = never blocks anything
  any_of_group         text,                           -- members of a group satisfy each other
  default_requested_from party_role,
  -- If set, sync_job_requirements() ticks it off from structured data.
  auto_check           text check (auto_check in
                        ('owner_address','survey_submitted','sound_positions',
                         'electrics','existing_heating','epc','planning')),
  sort_order           int not null default 100,
  active               boolean not null default true
);

create table job_requirements (
  id             uuid primary key default gen_random_uuid(),
  job_id         uuid not null references jobs(id) on delete cascade,
  requirement_id uuid not null references requirements(id),
  status         req_status not null default 'missing',
  requested_at   timestamptz,
  received_at    timestamptz,
  received_via   text check (received_via in ('manual','auto','upload','form')),
  file_url       text,
  waived_reason  text,
  note           text,
  unique (job_id, requirement_id)
);
create index on job_requirements (job_id);

-- Emailed no-account links (installer sound form etc.). Only a hash is stored.
create table request_links (
  id               uuid primary key default gen_random_uuid(),
  job_id           uuid references jobs(id) on delete cascade,  -- null for installer onboarding
  purpose          text not null check (purpose in
                     ('enquiry','welcome_form','new_build_form','sound_form','info_request',
                      'installer_onboarding','emitter_choice','spec_approval','installer_pricing',
                      'checkpoint_photos','remedial_photos','install_finished')),
  installer_id     uuid references installers(id),   -- onboarding links belong to the installer
  requirement_ids  uuid[] not null default '{}',
  recipient_role   party_role,
  recipient_email  text,
  token_hash       text not null unique,
  expires_at       timestamptz not null,
  used_at          timestamptz,
  created_by       uuid references staff(id),
  created_at       timestamptz not null default now()
);

-- ---------- lookups (from the Easy MCS room sheet & MCS 020 a) -------
create table opening_types (
  code        text not null,
  category    text not null check (category in ('window','door')),
  description text not null,
  u_value     numeric(3,1) not null,
  primary key (code),
  unique (code, category)
);

create table radiator_types (
  code        text primary key,
  description text not null
);

create table barrier_types (
  code          text primary key,
  label         text not null,
  barrier_class barrier_class not null,
  note          text
);

create table barrier_attenuation (
  barrier_class  barrier_class not null,
  line_of_sight  line_of_sight not null,
  attenuation_db numeric(3,1) not null,
  primary key (barrier_class, line_of_sight)
);

-- MCS 031 a) Table 1 (degree days / design low temp by postcode prefix).
-- Created for the pre-sale estimate; NOT seeded until checked against
-- the calculator Terri uses.
create table postcode_climate (
  prefix       text primary key,
  low_temp_c   numeric(3,1) not null,
  degree_days  int not null
);

-- ---------- survey (Easy MCS F20 + room sheet) ------------------------
create table surveys (
  id            uuid primary key default gen_random_uuid(),
  job_id        uuid not null unique references jobs(id) on delete cascade,
  status        survey_status not null default 'draft',
  -- site_survey: our surveyor, full F20 + room sheet (retrofit).
  -- new_build_form: short form sent by link; planning, noise and DNO questions only.
  form_kind     text not null default 'site_survey'
                check (form_kind in ('site_survey','new_build_form')),
  completed_by_role party_role,          -- new_build_form: installer / homeowner / main_contractor
  completed_by_name text,
  surveyor_id   uuid references staff(id),
  surveyed_on   date,
  submitted_at  timestamptz,

  -- Planning & general
  listed_or_conservation   boolean,
  permitted_development    boolean,
  other_planning_issues    text,
  building_regs_noncompliance boolean,
  protected_species        boolean,
  -- true = flagged, false = clear, null = not yet known (e.g. permitted development unanswered)
  planning_permission_may_be_needed boolean generated always as
     (case when listed_or_conservation is true or permitted_development is false then true
           when listed_or_conservation is false and permitted_development is true then false
      end) stored,

  -- System design
  heat_pump_type           text check (heat_pump_type in ('monobloc','f_gas_split')),
  proposed_emitter_types   text,
  design_notes             text,

  -- Building (mostly prefilled from enquiry / property checker / EPC)
  property_use             text default 'domestic',
  self_build               boolean,
  house_type               text,
  floors                   int,
  exposed_location         boolean,
  year_built               int,
  epc_valid                boolean,
  epc_needed_for_bus       boolean,

  -- Electrics (DNO application)
  electricity_phase        text check (electricity_phase in ('single','three')),
  fuse_rating_a            int  check (fuse_rating_a in (60,80,100)),
  -- false = new build with no supply yet, so no MPAN or cut-out to photograph
  supply_connected         boolean,
  cutout_photo_url         text,
  mpan                     text,

  -- Existing heating & fuel (BUS / uplift allowances)
  existing_fuel_type       text,
  existing_fuel_pence_kwh  numeric(6,2),
  existing_heat_source     text,
  electricity_pence_kwh    numeric(6,2),

  -- Occupancy
  occupants                int,
  bedrooms                 int,
  occupied_over_50pct      boolean,

  -- Equipment location
  hp_location              text,   -- also on the short new build form
  r290_zones_measured      boolean,
  cylinder_location        text,
  cylinder_cupboard_notes  text,

  updated_at               timestamptz not null default now()
);
create trigger surveys_updated_at before update on surveys
  for each row execute function set_updated_at();

create table survey_rooms (
  id                  uuid primary key default gen_random_uuid(),
  survey_id           uuid not null references surveys(id) on delete cascade,
  sort_order          int not null default 0,
  name                text not null,
  ufh_pipe_centres_mm int,
  floor_covering      text,
  comments            text
);

-- Windows, roof glazing and external doors as rows (no fixed "Window 1-3")
create table room_openings (
  id            uuid primary key default gen_random_uuid(),
  room_id       uuid not null references survey_rooms(id) on delete cascade,
  kind          text not null check (kind in ('window','roof_glazing','external_door')),
  width_m       numeric(5,2) not null check (width_m > 0),
  height_m      numeric(5,2) not null check (height_m > 0),
  type_code     text not null,
  type_category text generated always as
                  (case when kind = 'external_door' then 'door' else 'window' end) stored,
  foreign key (type_code, type_category) references opening_types (code, category)
);

create table room_emitters (
  id                 uuid primary key default gen_random_uuid(),
  room_id            uuid not null references survey_rooms(id) on delete cascade,
  role               text not null check (role in ('current','proposed')),
  radiator_type_code text references radiator_types(code),
  age_years          int,
  height_mm          int,
  length_mm          int,
  wall_height_m      numeric(4,2),   -- available wall space (proposed)
  wall_length_m      numeric(4,2),
  comments           text
);

-- ---------- sound: assessment positions (MCS 020 a)) ------------------
-- One row per window/door of a habitable room on a NEIGHBOURING property.
-- Filled by the surveyor (retrofit) or the installer's emailed form (new build).
create table assessment_positions (
  id                    uuid primary key default gen_random_uuid(),
  job_id                uuid not null references jobs(id) on delete cascade,
  source                text not null default 'surveyor'
                        check (source in ('surveyor','installer','homeowner','main_contractor','office')),
  assessed_on           date not null default current_date,
  property_description  text,       -- address, floor, room, window/door (step 2)
  habitable_confirmed   boolean not null default false,  -- not bath/WC/utility/hall/corridor
  reflective_surfaces   int check (reflective_surfaces between 1 and 3),  -- Q = 2^n
  distance_m            numeric(5,1) check (distance_m > 0),             -- to 0.1 m, from unit centre
  barrier_type_code     text references barrier_types(code),
  line_of_sight         line_of_sight,
  photo_url             text,
  notes                 text
);
create index on assessment_positions (job_id);

-- ---------- audit log -------------------------------------------------
create table event_log (
  id          bigserial primary key,
  at          timestamptz not null default now(),
  job_id      uuid,
  entity      text not null,
  entity_id   uuid,
  action      text not null,
  actor_kind  actor_kind not null default 'system',
  actor_label text,
  changes     jsonb
);
create index on event_log (job_id, at desc);

-- The app sets these per request:  select set_config('app.actor_kind','staff',true),
--                                          set_config('app.actor_label','Elliott',true);
-- SECURITY DEFINER: staff can't write to event_log directly, only through this trigger.
create function log_change() returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_old jsonb; v_new jsonb; v_changes jsonb; v_row jsonb; v_job uuid;
begin
  if tg_op = 'INSERT' then
    v_new := to_jsonb(new); v_changes := v_new; v_row := v_new;
  elsif tg_op = 'UPDATE' then
    v_old := to_jsonb(old); v_new := to_jsonb(new); v_row := v_new;
    select jsonb_object_agg(key, jsonb_build_object('from', v_old->key, 'to', v_new->key))
      into v_changes
      from jsonb_each(v_new)
     where v_new->key is distinct from v_old->key and key <> 'updated_at';
    if v_changes is null then return new; end if;
  else
    v_row := to_jsonb(old); v_changes := v_row;
  end if;
  v_job := coalesce(v_row->>'job_id', case when tg_table_name = 'jobs' then v_row->>'id' end)::uuid;
  insert into event_log (job_id, entity, entity_id, action, actor_kind, actor_label, changes)
  values (v_job, tg_table_name, (v_row->>'id')::uuid, lower(tg_op),
          coalesce(nullif(current_setting('app.actor_kind', true), ''), 'system')::actor_kind,
          nullif(current_setting('app.actor_label', true), ''),
          v_changes);
  return coalesce(new, old);
end $$;

create trigger log_jobs                after insert or update or delete on jobs
  for each row execute function log_change();
create trigger log_job_requirements    after update or delete on job_requirements
  for each row execute function log_change();
create trigger log_surveys             after insert or update or delete on surveys
  for each row execute function log_change();
create trigger log_assessment_positions after insert or update or delete on assessment_positions
  for each row execute function log_change();
create trigger log_heat_pump_models    after insert or update or delete on heat_pump_models
  for each row execute function log_change();

-- ---------- sound maths (MCS 020 a) step 7) ---------------------------
-- Lp = Lw + 10 log10( Q / (4 pi r^2) ) - AB   rounded to 0.1 dB(A)
create function sound_pressure_db(lw numeric, q int, r numeric, attenuation numeric)
returns numeric language sql immutable as $$
  select round(lw + 10 * log10(q::numeric / (4 * pi()::numeric * r * r)) - attenuation, 1)
$$;

-- Highest sound power a unit may have at this position and still pass.
-- Max Lw = limit - 10 log10( Q / (4 pi r^2) ) + AB   (ignores the 0.05 rounding allowance: conservative)
create function max_sound_power_db(q int, r numeric, attenuation numeric, lim numeric default 37.0)
returns numeric language sql immutable as $$
  select round(lim - 10 * log10(q::numeric / (4 * pi()::numeric * r * r)) + attenuation, 1)
$$;

create view assessment_position_calc with (security_invoker = true) as
select c.*,
       case when c.is_complete
            then max_sound_power_db(c.q, c.distance_m, c.attenuation_db,
                                    (select value::numeric from settings where key = 'sound_limit_db'))
       end as max_lw_db,
       (c.assessed_on < current_date -
          ((select value::int from settings where key = 'sound_assessment_stale_months') * 30)) as is_stale
from (
  select ap.*,
         (2 ^ ap.reflective_surfaces)::int as q,
         bt.barrier_class,
         ba.attenuation_db,
         (ap.property_description is not null and ap.habitable_confirmed
          and ap.reflective_surfaces is not null and ap.distance_m is not null
          and ap.barrier_type_code is not null
          and (bt.barrier_class = 'none' or ap.line_of_sight is not null)) as is_complete
  from assessment_positions ap
  left join barrier_types bt on bt.code = ap.barrier_type_code
  left join barrier_attenuation ba
         on ba.barrier_class = bt.barrier_class
        and ba.line_of_sight = coalesce(ap.line_of_sight, 'full_view')
) c;

-- Site limit = lowest max-Lw across complete positions; checks estimated & final unit.
create view job_sound_check with (security_invoker = true) as
select j.id as job_id, j.job_ref,
       agg.n_positions, agg.site_limit_lw, agg.any_stale,
       eu.model as estimated_model, eu.sound_power_db as estimated_lw,
       fu.model as final_model,     fu.sound_power_db as final_lw,
       case when agg.n_positions > 0 and eu.id is not null then
         not exists (select 1 from assessment_position_calc c
                      where c.job_id = j.id and c.is_complete
                        and sound_pressure_db(eu.sound_power_db, c.q, c.distance_m, c.attenuation_db)
                            > (select value::numeric from settings where key = 'sound_limit_db'))
       end as estimated_unit_passes,
       case when agg.n_positions > 0 and fu.id is not null then
         not exists (select 1 from assessment_position_calc c
                      where c.job_id = j.id and c.is_complete
                        and sound_pressure_db(fu.sound_power_db, c.q, c.distance_m, c.attenuation_db)
                            > (select value::numeric from settings where key = 'sound_limit_db'))
       end as final_unit_passes,
       -- Louder than the unit we assessed against, or output now outside the estimate
       (fu.sound_power_db > eu.sound_power_db) as recheck_sound,
       (j.final_heat_loss_kw is not null and j.estimated_heat_loss_kw is not null and
          (j.final_heat_loss_kw > j.estimated_heat_loss_kw *
             (1 + (select value::numeric from settings where key = 'heat_loss_recheck_pct') / 100)
           or j.final_heat_loss_kw > coalesce(eu.output_kw, 0))) as unit_review_needed
from jobs j
left join heat_pump_models eu on eu.id = j.estimated_unit_id
left join heat_pump_models fu on fu.id = j.final_unit_id
left join lateral (
  select count(*) as n_positions, min(max_lw_db) as site_limit_lw, bool_or(is_stale) as any_stale
  from assessment_position_calc c where c.job_id = j.id and c.is_complete
) agg on true;

-- ---------- requirements engine ---------------------------------------
create function generate_job_requirements(p_job uuid) returns int
language plpgsql as $$
declare n int;
begin
  insert into job_requirements (job_id, requirement_id)
  select j.id, r.id
    from jobs j
    join requirements r
      on r.active
     and (r.job_type is null or r.job_type = j.job_type)
     and (r.condition = 'always' or (r.condition = 'id_check_failed' and j.id_check_failed))
   where j.id = p_job
  on conflict (job_id, requirement_id) do nothing;
  get diagnostics n = row_count;
  return n;
end $$;

-- Ticks requirements that can be proven from structured data (never un-ticks).
create function sync_job_requirements(p_job uuid) returns void
language plpgsql as $$
begin
  update job_requirements jr
     set status = 'received', received_at = now(), received_via = 'auto'
    from requirements r, jobs j
   where jr.job_id = p_job
     and jr.requirement_id = r.id
     and j.id = jr.job_id
     and jr.status in ('missing','requested')
     and r.auto_check is not null
     and case r.auto_check
       when 'owner_address'    then j.owner_residential_address_id is not null
       when 'survey_submitted' then exists (select 1 from surveys s
                                             where s.job_id = j.id and s.status = 'submitted')
       when 'sound_positions'  then exists (select 1 from assessment_position_calc c
                                             where c.job_id = j.id and c.is_complete)
       when 'electrics'        then exists (select 1 from surveys s where s.job_id = j.id
                                             and s.electricity_phase is not null and s.fuse_rating_a is not null
                                             and (s.supply_connected is false
                                                  or (s.mpan is not null and s.cutout_photo_url is not null)))
       when 'existing_heating' then exists (select 1 from surveys s where s.job_id = j.id
                                             and s.existing_fuel_type is not null
                                             and s.existing_fuel_pence_kwh is not null
                                             and s.existing_heat_source is not null
                                             and s.electricity_pence_kwh is not null)
       when 'planning'         then exists (select 1 from surveys s where s.job_id = j.id
                                             and s.listed_or_conservation is not null
                                             and s.building_regs_noncompliance is not null
                                             and s.protected_species is not null)
       when 'epc'              then exists (select 1 from surveys s where s.job_id = j.id
                                             and s.year_built is not null and s.epc_valid is not null
                                             and (s.epc_valid or s.epc_needed_for_bus is not null))
       else false end;
end $$;

create function trg_jobs_requirements() returns trigger language plpgsql as $$
begin
  perform generate_job_requirements(new.id);
  perform sync_job_requirements(new.id);
  return null;
end $$;
create trigger jobs_requirements
  after insert or update of job_type, id_check_failed, owner_residential_address_id on jobs
  for each row execute function trg_jobs_requirements();

create function trg_sync_by_job() returns trigger language plpgsql as $$
begin
  perform sync_job_requirements(coalesce(new.job_id, old.job_id));
  return null;
end $$;
create trigger surveys_sync after insert or update or delete on surveys
  for each row execute function trg_sync_by_job();
create trigger positions_sync after insert or update or delete on assessment_positions
  for each row execute function trg_sync_by_job();

-- A requirement "unit" is a standalone requirement or a whole any-of group.
create view job_requirement_units with (security_invoker = true) as
select jr.job_id,
       coalesce(r.any_of_group, r.code)                              as unit_key,
       r.blocks_gate,
       bool_or(jr.status in ('received','waived'))                   as is_met,
       string_agg(r.label, ' or ' order by r.sort_order)             as label,
       (array_agg(r.default_requested_from order by r.sort_order))[1] as requested_from,
       min(r.sort_order)                                             as sort_order
from job_requirements jr
join requirements r on r.id = jr.requirement_id
group by jr.job_id, coalesce(r.any_of_group, r.code), r.blocks_gate;

-- job_gate_readiness and job_gaps live in the gates migration (they combine
-- these units with computed checks).

-- ---------- survey validation -----------------------------------------
create function survey_problems(p_survey uuid)
returns table (severity text, message text) language plpgsql stable as $$
declare s surveys%rowtype;
begin
  select * into s from surveys where id = p_survey;

  -- Short new-build form: planning, noise, DNO only. Permitted development is
  -- deliberately NOT required: a homeowner or contractor can't reliably answer it,
  -- so the office completes it (planning_permission_may_be_needed stays a flag).
  if s.form_kind = 'new_build_form' then
    if s.completed_by_name is null or s.completed_by_role is null then
      return query select 'error'::text, 'Please say who is completing this form and their role'::text; end if;
    if s.listed_or_conservation is null then
      return query select 'error', 'Is the property listed or in a conservation area?'; end if;
    if s.building_regs_noncompliance is null or s.protected_species is null then
      return query select 'error', 'Building Regulations and protected species questions are required'; end if;
    if s.hp_location is null or btrim(s.hp_location) = '' then
      return query select 'error', 'Proposed heat pump location is required (e.g. rear wall, left of the garage)'; end if;
    if s.electricity_phase is null or s.fuse_rating_a is null or s.supply_connected is null then
      return query select 'error', 'Electrics: phase, fuse rating and whether the supply is connected are required'; end if;
    if s.supply_connected and (s.mpan is null or s.cutout_photo_url is null) then
      return query select 'error', 'Electrics: MPAN and a cut-out photo are required once the supply is connected'; end if;
    if not exists (select 1 from assessment_position_calc c where c.job_id = s.job_id and c.is_complete) then
      return query select 'error', 'At least one complete noise assessment position is required'; end if;
    return;
  end if;

  if s.surveyor_id is null or s.surveyed_on is null then
    return query select 'error'::text, 'Surveyor and survey date are required'::text; end if;
  if s.listed_or_conservation is null or s.permitted_development is null then
    return query select 'error', 'Planning questions (listed/conservation, permitted development) are required'; end if;
  if s.heat_pump_type is null then
    return query select 'error', 'Heat pump type (monobloc / F-gas split) is required'; end if;
  if s.year_built is null or s.epc_valid is null then
    return query select 'error', 'Year built and EPC status are required'; end if;
  if s.electricity_phase is null or s.fuse_rating_a is null
     or (s.supply_connected is not false and (s.mpan is null or s.cutout_photo_url is null)) then
    return query select 'error', 'Electrics: phase, fuse rating, MPAN and cut-out photo are required'; end if;
  if s.existing_fuel_type is null or s.existing_fuel_pence_kwh is null
     or s.existing_heat_source is null or s.electricity_pence_kwh is null then
    return query select 'error', 'Existing heating and fuel details are required'; end if;
  if s.occupants is null or s.bedrooms is null or s.occupied_over_50pct is null then
    return query select 'error', 'Occupancy details are required'; end if;
  if s.hp_location is null or s.r290_zones_measured is null then
    return query select 'error', 'Heat pump location and R290 safety zone check are required'; end if;
  if not exists (select 1 from survey_rooms where survey_id = p_survey) then
    return query select 'error', 'At least one room is required'; end if;
  if not exists (select 1 from assessment_position_calc c where c.job_id = s.job_id and c.is_complete) then
    return query select 'error', 'At least one complete noise assessment position is required'; end if;
  return query
    select 'warning', 'Room "' || r.name || '" has no windows, doors or roof glazing'
      from survey_rooms r where r.survey_id = p_survey
       and not exists (select 1 from room_openings o where o.room_id = r.id);
  return query
    select 'warning', 'Room "' || r.name || '" has no proposed emitter'
      from survey_rooms r where r.survey_id = p_survey
       and not exists (select 1 from room_emitters e where e.room_id = r.id and e.role = 'proposed');
end $$;

create function submit_survey(p_survey uuid) returns void language plpgsql as $$
begin
  if exists (select 1 from survey_problems(p_survey) where severity = 'error') then
    raise exception 'Survey incomplete: %',
      (select string_agg(message, '; ') from survey_problems(p_survey) where severity = 'error');
  end if;
  update surveys set status = 'submitted', submitted_at = now() where id = p_survey;
end $$;
