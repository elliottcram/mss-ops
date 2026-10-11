-- =====================================================================
-- Tests 1: intake, requirements, survey, sound (MCS 020 a)).
-- Self-checking: any failure raises an exception naming the test.
-- Runs inside a transaction that is rolled back, so tests never leave data.
-- =====================================================================

begin;
create function _assert(cond boolean, msg text) returns void language plpgsql as $$
begin if cond is not true then raise exception 'TEST FAILED: %', msg; end if; end $$;

-- Blocking requirement gaps only (gates also have computed checks; see 02).
create function _req_unmet(p_job uuid, p_gate gate) returns int language sql as $$
  select count(*)::int from job_gaps where job_id = p_job and blocks_gate = p_gate and source = 'requirement'
$$;

do $$
declare
  v_mfr uuid; v_quiet uuid; v_loud uuid; v_inst uuid;
  v_addr uuid; v_owner_addr uuid; v_job uuid; v_ret uuid;
  v_survey uuid; v_room uuid; v_req uuid; v_n int; v_failed boolean;
begin
  ---------------------------------------------------------------------
  -- 1. Sound maths vs MCS 020 a) Appendix A worked examples
  ---------------------------------------------------------------------
  perform _assert(sound_pressure_db(60, 4, 8,  5)  = 32.0, 'position 1: expected 32.0 (standard shows 31.96)');
  perform _assert(sound_pressure_db(60, 4, 5, 10)  = 31.0, 'position 2: expected 31.0 (standard shows 31.04)');
  perform _assert(sound_pressure_db(60, 4, 15, 0)  = 31.5, 'position 3: expected 31.5 (standard shows 31.50)');
  perform _assert((select attenuation_db from barrier_attenuation where barrier_class='type_1' and line_of_sight='no_view')      = 10,  'type 1 / no view');
  perform _assert((select attenuation_db from barrier_attenuation where barrier_class='type_1' and line_of_sight='partial_view') = 5,   'type 1 / partial');
  perform _assert((select attenuation_db from barrier_attenuation where barrier_class='type_2' and line_of_sight='no_view')      = 5,   'type 2 / no view');
  perform _assert((select attenuation_db from barrier_attenuation where barrier_class='type_2' and line_of_sight='partial_view') = 2.5, 'type 2 / partial');
  perform _assert(sound_pressure_db(max_sound_power_db(4, 8, 5), 4, 8, 5) between 36.9 and 37.1, 'max Lw round trip');

  ---------------------------------------------------------------------
  -- 2. New build job
  ---------------------------------------------------------------------
  insert into manufacturers (name) values ('TestMake') returning id into v_mfr;
  insert into heat_pump_models (manufacturer_id, model, output_kw, sound_power_db) values (v_mfr,'Quiet 8', 8.0,55.0) returning id into v_quiet;
  insert into heat_pump_models (manufacturer_id, model, output_kw, sound_power_db) values (v_mfr,'Loud 12',12.0,70.0) returning id into v_loud;
  insert into installers (name, default_manufacturer_id) values ('Test Installer', v_mfr) returning id into v_inst;
  insert into addresses (line1, plot_or_site_name) values ('Land at Test Lane','Plot 4') returning id into v_addr;
  insert into addresses (line1, postcode) values ('1 Current Road','AA1 1AA') returning id into v_owner_addr;

  perform set_config('app.actor_kind','staff',true);
  perform set_config('app.actor_label','Test user',true);

  insert into jobs (job_ref) values ('T-0001') returning id into v_job;      -- job_ref is the only mandatory field
  perform _assert((select count(*) from job_requirements where job_id = v_job) = 0, 'no job type yet => no requirements');
  perform _assert(not (select ready from job_gate_readiness where job_id = v_job and gate='heat_loss'), 'untyped job is never ready');

  update jobs set job_type='new_build', installer_id=v_inst, install_address_id=v_addr,
                  estimated_unit_id=v_quiet, estimated_heat_loss_kw=7.5 where id=v_job;
  select count(*) into v_n from job_requirements where job_id=v_job;
  perform _assert(v_n = 10, 'new build => 10 requirement rows, got '||v_n);
  perform _assert((select unmet from job_gate_readiness where job_id=v_job and gate='heat_loss') = 3,
                  'heat loss blockers: floor plans, sections, elevations-or-windows = 3 (sound blocks the spec, not the heat loss)');
  perform _assert(_req_unmet(v_job, 'send_spec') = 1, 'noise positions block sending the spec');
  perform _assert((select count(*) from job_gaps where job_id=v_job and not blocking) = 2,
                  'SAP-or-construction-notes and planning questions show as non-blocking gaps');

  -- any-of group: ONE member satisfies it
  update job_requirements set status='received' where job_id=v_job
     and requirement_id=(select id from requirements where code='nb_window_schedule');
  perform _assert((select unmet from job_gate_readiness where job_id=v_job and gate='heat_loss') = 2, 'window schedule alone satisfies the elevations group');

  update job_requirements set status='received' where job_id=v_job
     and requirement_id in (select id from requirements where code in ('nb_floor_plans','nb_sections'));
  perform _assert((select ready from job_gate_readiness where job_id=v_job and gate='heat_loss'), 'new build ready for heat loss without noise details');
  perform _assert(_req_unmet(v_job, 'send_spec') = 1, 'spec still blocked by noise details');

  -- Sound details auto-tick only when an assessment position is COMPLETE
  insert into assessment_positions (job_id, source, property_description, habitable_confirmed, reflective_surfaces, distance_m, barrier_type_code, line_of_sight)
    values (v_job,'installer','16 Willis Close, 1st floor bedroom window', false, 2, 8.0, 'masonry_wall','partial_view');
  perform _assert(_req_unmet(v_job, 'send_spec') = 1, 'habitable room not confirmed => incomplete');
  update assessment_positions set habitable_confirmed = true where job_id=v_job;
  perform _assert(_req_unmet(v_job, 'send_spec') = 0, 'complete position ticks the noise requirement');

  -- Worked example positions 2 & 3 and the site limit
  insert into assessment_positions (job_id, source, property_description, habitable_confirmed, reflective_surfaces, distance_m, barrier_type_code, line_of_sight)
    values (v_job,'installer','16 Willis Close, ground floor French windows', true, 2, 5.0, 'masonry_wall','no_view'),
           (v_job,'installer','8 Grange Road, 1st floor bedroom',            true, 2, 15.0,'fence_open',  'full_view');
  perform _assert((select n_positions from job_sound_check where job_id=v_job) = 3, 'three complete positions');
  perform _assert((select site_limit_lw from job_sound_check where job_id=v_job) between 65.0 and 65.1, 'site limit is set by position 1 (about 65.0)');
  perform _assert((select estimated_unit_passes from job_sound_check where job_id=v_job), '55 dB(A) unit passes provisionally');

  -- Final unit louder than the estimate: fails and flags a recheck
  update jobs set final_unit_id=v_loud, final_heat_loss_kw=11.0 where id=v_job;
  perform _assert(not (select final_unit_passes from job_sound_check where job_id=v_job), '70 dB(A) unit fails');
  perform _assert((select recheck_sound from job_sound_check where job_id=v_job), 'louder final unit => recheck sound');
  perform _assert((select unit_review_needed from job_sound_check where job_id=v_job), '11.0 kW vs 7.5 kW estimate (+47%) => review');

  -- Open fencing and vegetation give no attenuation, even with "no view"
  insert into assessment_positions (job_id, property_description, habitable_confirmed, reflective_surfaces, distance_m, barrier_type_code, line_of_sight)
    values (v_job,'test', true, 1, 10.0, 'vegetation','no_view');
  perform _assert((select attenuation_db from assessment_position_calc where job_id=v_job and property_description='test') = 0, 'vegetation counts as no barrier');
  perform _assert((select q from assessment_position_calc where job_id=v_job and property_description='test') = 2, 'one surface => Q2');

  ---------------------------------------------------------------------
  -- 3. Owner residential address: new build only
  ---------------------------------------------------------------------
  update jobs set owner_residential_address_id = v_owner_addr where id=v_job;
  perform _assert(_req_unmet(v_job, 'bus_application') = 0, 'owner address ticks the BUS requirement');

  insert into jobs (job_ref, job_type) values ('T-0002','retrofit') returning id into v_ret;
  v_failed := false;
  begin update jobs set owner_residential_address_id = v_owner_addr where id=v_ret;
  exception when check_violation then v_failed := true; end;
  perform _assert(v_failed, 'retrofit must reject an owner residential address');

  ---------------------------------------------------------------------
  -- 4. ID check failure adds the exception requirements
  ---------------------------------------------------------------------
  perform _assert(not exists (select 1 from job_requirements jr join requirements r on r.id=jr.requirement_id
                               where jr.job_id=v_job and r.code='x_photo_id'), 'no photo ID requirement by default');
  update jobs set id_check_failed = true where id=v_job;
  perform _assert((select count(*) from job_requirements jr join requirements r on r.id=jr.requirement_id
                    where jr.job_id=v_job and r.code in ('x_photo_id','x_utility_bills')) = 2, 'failed ID check adds photo ID + utility bills');
  perform _assert(not (select ready from job_gate_readiness where job_id=v_job and gate='bus_application'), 'BUS gate blocked again');

  ---------------------------------------------------------------------
  -- 5. Retrofit survey: validation, submit, gates
  ---------------------------------------------------------------------
  perform _assert((select count(*) from job_requirements where job_id=v_ret) = 6, 'retrofit => 6 requirement rows');
  insert into surveys (job_id) values (v_ret) returning id into v_survey;
  v_failed := false;
  begin perform submit_survey(v_survey); exception when others then v_failed := true; end;
  perform _assert(v_failed, 'empty survey cannot be submitted');

  insert into staff (name, role) values ('Surveyor','surveyor');
  update surveys set surveyor_id=(select id from staff limit 1), surveyed_on=current_date,
     listed_or_conservation=false, permitted_development=true, heat_pump_type='monobloc',
     year_built=1975, epc_valid=true, electricity_phase='single', fuse_rating_a=80, mpan='1234567890123',
     cutout_photo_url='x', existing_fuel_type='gas', existing_fuel_pence_kwh=7.5, existing_heat_source='Boiler',
     electricity_pence_kwh=27, occupants=3, bedrooms=3, occupied_over_50pct=true, hp_location='Rear', r290_zones_measured=true
   where id=v_survey;
  insert into survey_rooms (survey_id, name) values (v_survey,'Lounge') returning id into v_room;
  insert into assessment_positions (job_id, property_description, habitable_confirmed, reflective_surfaces, distance_m, barrier_type_code, line_of_sight)
    values (v_ret,'No.2 side window', true, 2, 6.0, 'fence_closed_under18','partial_view');
  perform _assert(exists (select 1 from survey_problems(v_survey) where severity='warning' and message like '%Lounge%no windows%'), 'warning for room with no openings');

  insert into room_openings (room_id, kind, width_m, height_m, type_code) values (v_room,'window',1.2,1.1,'W7');
  v_failed := false;
  begin insert into room_openings (room_id, kind, width_m, height_m, type_code) values (v_room,'external_door',1,2,'W7');
  exception when foreign_key_violation then v_failed := true; end;
  perform _assert(v_failed, 'a door cannot use a window glazing type');

  perform submit_survey(v_survey);
  perform _assert((select status from surveys where id=v_survey) = 'submitted', 'survey submitted');
  perform _assert((select ready from job_gate_readiness where job_id=v_ret and gate='heat_loss') is false, 'survey floor plan document still missing');
  update job_requirements set status='received' where job_id=v_ret
     and requirement_id=(select id from requirements where code='rt_survey_floor_plan');
  perform _assert((select ready from job_gate_readiness where job_id=v_ret and gate='heat_loss'), 'retrofit ready for heat loss');
  perform _assert(not (select ready from job_gate_readiness where job_id=v_ret and gate='dno'), 'DNO also needs the heat pump model');
  update jobs set final_unit_id = v_quiet where id = v_ret;
  perform _assert((select ready from job_gate_readiness where job_id=v_ret and gate='dno'), 'electrics + model => DNO gate ready');
  perform _assert(_req_unmet(v_ret, 'bus_application') = 0, 'existing heating + EPC tick the BUS requirements');
  perform _assert(not (select ready from job_gate_readiness where job_id=v_ret and gate='bus_application'), 'BUS still waits for the contract');
  perform _assert((select planning_permission_may_be_needed from surveys where id=v_survey) is false, 'no planning flag when PD applies');

  ---------------------------------------------------------------------
  -- 5b. New build short form (planning + noise + DNO), sent to installer/homeowner/contractor
  ---------------------------------------------------------------------
  perform _assert(not (select ready from job_gate_readiness where job_id=v_job and gate='dno'), 'DNO gate blocked before the form');
  insert into surveys (job_id, form_kind) values (v_job, 'new_build_form') returning id into v_survey;
  v_failed := false;
  begin perform submit_survey(v_survey); exception when others then v_failed := true; end;
  perform _assert(v_failed, 'empty new build form cannot be submitted');

  update surveys set completed_by_role='main_contractor', completed_by_name='A. Builder',
     listed_or_conservation=false, building_regs_noncompliance=false, protected_species=false,
     electricity_phase='single', fuse_rating_a=100, supply_connected=true where id=v_survey;
  perform _assert(exists (select 1 from survey_problems(v_survey) where severity='error' and message like 'Proposed heat pump location%'),
                  'new build form requires a proposed heat pump location');
  update surveys set hp_location='Rear wall, left of the garage' where id=v_survey;
  perform _assert(not exists (select 1 from survey_problems(v_survey) where message like 'Proposed heat pump location%'), 'location error clears');
  v_failed := false;
  begin perform submit_survey(v_survey); exception when others then v_failed := true; end;
  perform _assert(v_failed and exists (select 1 from survey_problems(v_survey) where message like '%MPAN%'),
                  'connected supply needs MPAN and cut-out photo');
  perform _assert((select unmet from job_gate_readiness where job_id=v_job and gate='dno') = 1, 'electrics not ticked without MPAN/photo');

  update surveys set supply_connected=false where id=v_survey;          -- no supply yet
  perform submit_survey(v_survey);                                       -- permitted development left blank on purpose
  perform _assert((select ready from job_gate_readiness where job_id=v_job and gate='dno'), 'electrics ticked when supply not yet connected');
  perform _assert(not exists (select 1 from job_gaps where job_id=v_job and label like 'Planning%'), 'planning requirement ticked by the form');
  perform _assert((select planning_permission_may_be_needed from surveys where id=v_survey) is null,
                  'PD unanswered => flag unknown, not false');
  update surveys set permitted_development=false where id=v_survey;
  perform _assert((select planning_permission_may_be_needed from surveys where id=v_survey), 'PD = no => planning may be needed');

  ---------------------------------------------------------------------
  -- 6. Audit log
  ---------------------------------------------------------------------
  perform _assert((select count(*) from event_log where job_id=v_job) > 5, 'events were logged for the job');
  perform _assert(exists (select 1 from event_log where entity='jobs' and action='update'
                          and actor_label='Test user' and changes ? 'job_type'), 'job_type change logged with actor');
end $$;

rollback;
