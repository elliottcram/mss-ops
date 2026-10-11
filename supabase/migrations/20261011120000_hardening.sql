-- =====================================================================
-- Fixes from Supabase's security and performance checks (11 Oct 2026).
-- =====================================================================

-- Pin every function's search_path so a caller can't swap in look-alike objects.
alter function set_updated_at()                                   set search_path = public;
alter function sound_pressure_db(numeric, int, numeric, numeric)  set search_path = public;
alter function max_sound_power_db(int, numeric, numeric, numeric) set search_path = public;
alter function generate_job_requirements(uuid)                    set search_path = public;
alter function sync_job_requirements(uuid)                        set search_path = public;
alter function trg_jobs_requirements()                            set search_path = public;
alter function trg_sync_by_job()                                  set search_path = public;
alter function survey_problems(uuid)                              set search_path = public;
alter function submit_survey(uuid)                                set search_path = public;
alter function milestone_on(uuid, text)                           set search_path = public;
alter function trg_certificate_order()                            set search_path = public;
alter function next_payment_run(date)                             set search_path = public;
alter function trg_voucher_expiry()                               set search_path = public;
alter function add_working_days(date, int)                        set search_path = public;

-- Nobody signed out may call any function. log_change() only ever runs as a
-- trigger; is_staff() stays callable by signed-in users because every
-- row-level security policy uses it.
revoke execute on all functions in schema public from public, anon;
revoke execute on function log_change() from authenticated;
alter default privileges in schema public revoke execute on functions from public, anon;

-- Index every foreign key (joins and deletes stay fast as jobs pile up).
create index on assessment_positions (barrier_type_code);
create index on complaints (handler_id);
create index on complaints (installer_id);
create index on complaints (job_id);
create index on installer_payouts (installer_id);
create index on installer_payouts (job_id);
create index on installer_payouts (job_payment_id);
create index on installer_prices (checked_by);
create index on installer_prices (job_id);
create index on installer_prices (spec_version_id);
create index on installers (address_id);
create index on installers (default_manufacturer_id);
create index on job_checkpoint_photos (checkpoint_code);
create index on job_checkpoint_photos (reviewed_by);
create index on job_milestones (milestone_code);
create index on job_operatives (operative_id);
create index on job_requirements (requirement_id);
create index on jobs (estimated_unit_id);
create index on jobs (final_unit_id);
create index on jobs (install_address_id);
create index on jobs (installer_id);
create index on jobs (manufacturer_id);
create index on jobs (owner_residential_address_id);
create index on jobs (technical_supervisor_id);
create index on level_rules (credential_type_code);
create index on nonconformities (job_id);
create index on operative_credentials (credential_type_code);
create index on operative_credentials (verified_by);
create index on operatives (staff_id);
create index on remedials (accepted_by);
create index on request_links (created_by);
create index on request_links (installer_id);
create index on request_links (job_id);
create index on room_emitters (radiator_type_code);
create index on room_emitters (room_id);
create index on room_openings (room_id);
create index on room_openings (type_code, type_category);
create index on survey_rooms (survey_id);
create index on surveys (surveyor_id);
