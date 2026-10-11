-- =====================================================================
-- Tests 2: one retrofit job taken from contract to close, plus the
-- supervision, money, deadline and complaint rules on the way.
-- =====================================================================

begin;
create function _assert(cond boolean, msg text) returns void language plpgsql as $$
begin if cond is not true then raise exception 'TEST FAILED: %', msg; end if; end $$;

create function _missing(p_job uuid, p_gate gate) returns text language sql as $$
  select coalesce(string_agg(label, '; '), '') from job_gaps where job_id = p_job and blocks_gate = p_gate
$$;

do $$
declare
  v_mfr uuid; v_unit uuid; v_inst uuid; v_lead uuid; v_trainee uuid; v_ts uuid;
  v_job uuid; v_spec uuid; v_pay1 uuid; v_pay2 uuid; v_rem uuid; v_failed boolean;
  v_signed date := current_date - 30;
begin
  ---------------------------------------------------------------------
  -- 1. Pure functions
  ---------------------------------------------------------------------
  perform _assert(next_payment_run('2026-10-12') = '2026-10-13', 'Monday -> Tuesday run');
  perform _assert(next_payment_run('2026-10-13') = '2026-10-16', 'paid Tuesday -> Friday run');
  perform _assert(next_payment_run('2026-10-16') = '2026-10-20', 'paid Friday -> next Tuesday');
  perform _assert(add_working_days('2026-10-09', 2) = '2026-10-13', 'Friday + 2 working days = Tuesday');
  perform _assert(add_working_days('2026-12-24', 2) = '2026-12-30', 'Christmas bank holidays skipped');
  perform _assert((select colour from supervision_matrix where level='skilled' and risk='medium') = 'amber', 'skilled x medium = amber');
  perform _assert((select colour from supervision_matrix where level='skilled_qualified' and risk='high') = 'amber', 'S&Q x high = amber');
  perform _assert((select colour from supervision_matrix where level='supervised' and risk='low') = 'amber', 'supervised x low = amber');

  ---------------------------------------------------------------------
  -- 2. Installer onboarding and operative levels
  ---------------------------------------------------------------------
  insert into manufacturers (name) values ('PipeMake') returning id into v_mfr;
  insert into heat_pump_models (manufacturer_id, model, output_kw, sound_power_db)
    values (v_mfr, 'Eight', 8.0, 55.0) returning id into v_unit;
  insert into installers (name) values ('Pipeline Heating') returning id into v_inst;
  perform _assert(cardinality((select missing from installer_onboarding where installer_id = v_inst)) >= 8,
                  'new installer has a long onboarding list');

  insert into operatives (installer_id, name, easymcs_setup_on, r07_received_on)
    values (v_inst, 'Lead Fitter', current_date, current_date) returning id into v_lead;
  insert into operatives (installer_id, name, easymcs_setup_on, r07_received_on)
    values (v_inst, 'Apprentice', current_date, current_date) returning id into v_trainee;
  insert into operatives (name, is_technical_supervisor, ts_assessed_on)
    values ('MSS Technical Supervisor', true, current_date) returning id into v_ts;

  -- Credentials -> suggested level
  insert into operative_credentials (operative_id, credential_type_code, expires_on) values
    (v_lead, 'nvq3_plumbing', null),
    (v_lead, 'manufacturer_training', current_date + 365);
  insert into operative_levels (operative_id, technology, level) values
    (v_lead, 'air_source_heat_pump', 'skilled_qualified'),
    (v_trainee, 'air_source_heat_pump', 'supervised');
  perform _assert((select suggested_level from operative_level_check where operative_id = v_lead) = 'skilled',
                  'NVQ + manufacturer training suggests Skilled');
  perform _assert((select differs from operative_level_check where operative_id = v_lead),
                  'recorded S&Q without the MCS award is flagged');
  insert into operative_credentials (operative_id, credential_type_code) values (v_lead, 'mcs_hp_award');
  perform _assert((select suggested_level from operative_level_check where operative_id = v_lead) = 'skilled_qualified',
                  'adding the MCS award suggests S&Q');
  update operative_levels set level = 'skilled' where operative_id = v_lead;   -- use Skilled for the job below
  update operative_credentials set expires_on = current_date - 1
   where operative_id = v_lead and credential_type_code = 'manufacturer_training';
  perform _assert(exists (select 1 from credential_expiry where operative_id = v_lead and expired), 'expired credential listed');
  update operative_credentials set expires_on = current_date + 365
   where operative_id = v_lead and credential_type_code = 'manufacturer_training';

  update installers set contact_name='Pat', email='pat@example.com', easymcs_subcontractor_on=current_date,
         default_manufacturer_id=v_mfr, f05_signed_on=current_date,
         public_liability_expires_on=current_date+200, employers_liability_expires_on=current_date+200,
         calibration_expires_on=current_date+200, r09_approved_on=current_date
   where id = v_inst;
  perform _assert(cardinality((select missing from installer_onboarding where installer_id = v_inst)) = 0,
                  'installer onboarded: ' || array_to_string((select missing from installer_onboarding where installer_id = v_inst), ', '));
  update installers set supplies_technical_supervisor = true where id = v_inst;
  perform _assert(exists (select 1 from installer_onboarding where installer_id = v_inst and 'Signed F05A Technical Supervisor Agreement' = any (missing)),
                  'supplying a TS needs F05A');
  update installers set supplies_technical_supervisor = false where id = v_inst;

  ---------------------------------------------------------------------
  -- 3. Job setup and spec
  ---------------------------------------------------------------------
  insert into jobs (job_ref, job_type, installer_id, final_unit_id, final_heat_loss_kw, stage)
    values ('P-0001', 'retrofit', v_inst, v_unit, 7.2, 'design') returning id into v_job;
  perform _assert(not (select ready from job_gate_readiness where job_id=v_job and gate='setup_complete'), 'survey not booked yet');
  insert into job_milestones (job_id, milestone_code) values (v_job, 'survey_booked');
  perform _assert((select ready from job_gate_readiness where job_id=v_job and gate='setup_complete'), 'setup complete');

  insert into assessment_positions (job_id, property_description, habitable_confirmed, reflective_surfaces, distance_m, barrier_type_code, line_of_sight)
    values (v_job, 'No.3 bedroom', true, 2, 8.0, 'masonry_wall', 'partial_view');
  perform _assert(_missing(v_job, 'send_spec') like '%specified%' and _missing(v_job, 'send_spec') like '%calculation attached%',
                  'spec gate lists what is missing: ' || _missing(v_job, 'send_spec'));
  insert into job_milestones (job_id, milestone_code) values (v_job, 'spec_complete');
  insert into spec_versions (job_id, version, heat_loss_pdf_url, sent_on)
    values (v_job, 1, 'hl-v1.pdf', current_date) returning id into v_spec;
  perform _assert((select ready from job_gate_readiness where job_id=v_job and gate='send_spec'),
                  'spec can be sent: ' || _missing(v_job, 'send_spec'));

  -- Approvals apply to a version; a new version resets them
  update spec_versions set installer_approved_at = now(), homeowner_approved_at = now() where id = v_spec;
  perform _assert((select approved from job_current_spec where job_id = v_job), 'v1 approved');
  insert into spec_versions (job_id, version, heat_loss_pdf_url) values (v_job, 2, 'hl-v2.pdf') returning id into v_spec;
  perform _assert(not (select approved from job_current_spec where job_id = v_job), 'v2 needs approving again');
  update spec_versions set installer_approved_at = now(), homeowner_approved_at = now() where id = v_spec;

  ---------------------------------------------------------------------
  -- 4. Pricing, quote, money
  ---------------------------------------------------------------------
  v_failed := false;
  begin
    update jobs set quote_total_before_grant = 14000, bus_grant_amount = 7500, contract_value = 14000 where id = v_job;
  exception when check_violation then v_failed := true; end;
  perform _assert(v_failed, 'contract value must have the BUS grant deducted');

  update jobs set quote_ref='Q-77', quote_date=current_date - 40, quote_total_before_grant=14000,
                  bus_grant_amount=7500, heat_pump_cost=6000, contract_value=6500 where id = v_job;
  insert into installer_prices (job_id, spec_version_id, method, total) values (v_job, v_spec, 'form', 12000);
  insert into job_milestones (job_id, milestone_code) values
    (v_job, 'performance_estimate_uploaded'), (v_job, 'proposal_pack_complete');
  insert into job_payments (job_id, kind, amount_due, due_on) values
    (v_job, 'deposit', 2000, v_signed) returning id into v_pay1;
  perform _assert(_missing(v_job, 'contract') = 'Payment schedule adds up to the contract value',
                  'only the schedule is missing: ' || _missing(v_job, 'contract'));
  insert into job_payments (job_id, kind, amount_due, due_on) values
    (v_job, 'final', 4500, current_date + 60) returning id into v_pay2;
  perform _assert((select ready from job_gate_readiness where job_id=v_job and gate='contract'), 'contract can go out');

  perform _assert((select deposit_cover_limit from job_money where job_id = v_job) = 1625, '25% of 6,500 = 1,625 (under the 5,000 cap)');
  perform _assert((select upfront_total from job_money where job_id = v_job) > 1625, 'deposit above HIES cover is detectable');

  update job_payments set paid_amount = 1900, paid_on = v_signed + 2 where id = v_pay1;
  perform _assert((select mismatched_payments from job_money where job_id = v_job) = 1, 'wrong amount and late payment flagged');
  update job_payments set paid_amount = 2000, paid_on = v_signed where id = v_pay1;
  perform _assert((select mismatched_payments from job_money where job_id = v_job) = 0, 'matching payment not flagged');

  ---------------------------------------------------------------------
  -- 5. Contract, HIES, BUS
  ---------------------------------------------------------------------
  insert into job_milestones (job_id, milestone_code, done_on) values (v_job, 'contract_signed', v_signed);
  perform _assert((select status from job_deadlines where job_id=v_job and code='hies_register') = 'overdue',
                  'HIES registration overdue 30 days after signing');
  insert into hies_registrations (job_id, registered_on, deposit_amount, deposit_paid_on)
    values (v_job, v_signed + 3, 2000, v_signed);
  perform _assert((select status from job_deadlines where job_id=v_job and code='hies_register') = 'done', 'HIES registration done');
  perform _assert((select due_on from job_deadlines where job_id=v_job and code='hies_deposit_cover') = v_signed + 123,
                  'deposit cover ends 120 days after registration');

  insert into bus_applications (job_id, submitted_total_before_grant, submitted_grant, submitted_heat_pump_cost,
                                submitted_quote_ref, submitted_quote_date, applied_on, consent_requested_on)
    values (v_job, 14000, 7500, 6000, 'Q-77', current_date - 40, v_signed + 4, current_date - 2);
  perform _assert(not (select figures_differ_from_quote from job_bus where job_id = v_job), 'BUS figures match the quote');
  perform _assert((select due_on from job_deadlines where job_id=v_job and code='bus_consent') = current_date + 12,
                  'homeowner consent due 14 days after Ofgem emails');
  update jobs set heat_pump_cost = 6100, contract_value = 6500 where id = v_job;
  perform _assert((select figures_differ_from_quote from job_bus where job_id = v_job), 'changed quote no longer matches BUS');
  update jobs set heat_pump_cost = 6000 where id = v_job;

  update bus_applications set consent_given_on = current_date, voucher_id = 'V1', voucher_issued_on = current_date
   where job_id = v_job;
  perform _assert((select voucher_expires_on from bus_applications where job_id = v_job) = (current_date + interval '3 months')::date,
                  'voucher expiry filled in as 3 months');

  ---------------------------------------------------------------------
  -- 6. Ready to install
  ---------------------------------------------------------------------
  perform _assert(_missing(v_job, 'ready_to_install') like '%Operatives%' and _missing(v_job, 'ready_to_install') like '%Risk level%',
                  'operatives and risk missing: ' || _missing(v_job, 'ready_to_install'));
  insert into job_operatives (job_id, operative_id, is_lead) values (v_job, v_trainee, false);
  perform _assert((select supervised_without_skilled from job_supervision where job_id = v_job), 'apprentice alone is flagged');
  insert into job_operatives (job_id, operative_id, is_lead) values (v_job, v_lead, true);
  v_failed := false;
  begin update job_operatives set is_lead = true where job_id = v_job and operative_id = v_trainee;
  exception when unique_violation then v_failed := true; end;
  perform _assert(v_failed, 'only one lead operative per job');

  update jobs set risk_level = 'medium', risk_reasoning = 'Manufacturer-trained team, standard design',
                  technical_supervisor_id = v_ts where id = v_job;
  perform _assert((select colour from job_supervision where job_id = v_job) = 'amber', 'skilled lead x medium risk = amber');
  perform _assert(_missing(v_job, 'ready_to_install') like '%Method statement%', 'amber needs a method statement');
  insert into job_milestones (job_id, milestone_code) values (v_job, 'method_statement_issued'), (v_job, 'risk_assessment_received');

  -- Cooling-off: install inside 14 days of signing needs F08B
  update job_milestones set done_on = current_date - 3 where job_id = v_job and milestone_code = 'contract_signed';
  update jobs set planned_install_start = current_date + 5 where id = v_job;
  perform _assert(_missing(v_job, 'ready_to_install') = 'Cooling-off ended, or express consent (F08B) signed',
                  'only cooling-off blocks: ' || _missing(v_job, 'ready_to_install'));
  update jobs set express_consent_signed_on = current_date - 3 where id = v_job;
  perform _assert((select ready from job_gate_readiness where job_id=v_job and gate='ready_to_install'),
                  'ready to install: ' || _missing(v_job, 'ready_to_install'));

  -- DNO only holds the install when flagged
  insert into dno_applications (job_id, application_type, submitted_on) values (v_job, 'apply_to_connect', current_date);
  perform _assert((select ready from job_gate_readiness where job_id=v_job and gate='ready_to_install'), 'DNO pending does not hold the install');
  update dno_applications set approval_needed_before_install = true where job_id = v_job;
  perform _assert(not (select ready from job_gate_readiness where job_id=v_job and gate='ready_to_install'), 'flagged DNO holds the install');
  update dno_applications set approval_needed_before_install = false where job_id = v_job;
  perform _assert(not (select ready from job_gate_readiness where job_id=v_job and gate='switch_on'), 'no switch-on before DNO approval');

  -- Voucher expiring before the install blocks it
  update jobs set planned_install_finish = current_date + 120 where id = v_job;
  perform _assert(not (select ready from job_gate_readiness where job_id=v_job and gate='ready_to_install'), 'voucher would expire first');
  update jobs set planned_install_finish = current_date + 10 where id = v_job;

  ---------------------------------------------------------------------
  -- 7. Install, checkpoints, commissioning, remedials
  ---------------------------------------------------------------------
  perform _assert((select count(*) from job_checkpoint_status where job_id = v_job) = 5, 'amber job has 5 photo checkpoints');
  insert into job_milestones (job_id, milestone_code, done_on) values
    (v_job, 'install_completed', current_date - 1), (v_job, 'commissioned', current_date - 1),
    (v_job, 'hp_commissioning_sheet', current_date - 1), (v_job, 'cylinder_commissioning_sheet', current_date - 1),
    (v_job, 'ts_commissioning_signoff', current_date - 1);
  insert into job_checkpoint_photos (job_id, checkpoint_code, photo_url, review_status)
    select v_job, code, 'p.jpg', 'accepted' from job_checkpoint_status where job_id = v_job;
  insert into remedials (job_id, raised_from, description) values (v_job, 'commissioning', 'Lag the flow pipe')
    returning id into v_rem;
  perform _assert(_missing(v_job, 'certification') like '%remedial%', 'open remedial blocks certification');
  update remedials set accepted_on = current_date where id = v_rem;

  -- HIES -> NAPIT -> MCS order
  v_failed := false;
  begin insert into job_milestones (job_id, milestone_code) values (v_job, 'napit_notified');
  exception when others then v_failed := true; end;
  perform _assert(v_failed, 'NAPIT before HIES completion is refused');
  update hies_registrations set completion_entered_on = current_date where job_id = v_job;
  insert into job_milestones (job_id, milestone_code) values (v_job, 'napit_notified');
  perform _assert((select ready from job_gate_readiness where job_id=v_job and gate='certification'),
                  'ready for MCS certificate: ' || _missing(v_job, 'certification'));
  perform _assert((select due_on from job_deadlines where job_id=v_job and code='mcs_certificate') = current_date + 29,
                  'MCS certificate due 30 days after commissioning');

  ---------------------------------------------------------------------
  -- 8. Close
  ---------------------------------------------------------------------
  update dno_applications set approved_on = current_date where job_id = v_job;
  perform _assert((select ready from job_gate_readiness where job_id=v_job and gate='switch_on'), 'switch-on allowed after DNO');
  insert into job_milestones (job_id, milestone_code) values
    (v_job, 'mcs_certificate_issued'), (v_job, 'handover_items_received'), (v_job, 'handover_sent');
  update hies_registrations set guarantee_sent_on = current_date where job_id = v_job;
  update bus_applications set redeemed_on = current_date where job_id = v_job;
  update job_payments set paid_amount = 4500, paid_on = current_date where id = v_pay2;
  perform _assert(_missing(v_job, 'close') = 'Installer paid', 'only the installer payment left: ' || _missing(v_job, 'close'));
  insert into installer_payouts (job_id, installer_id, job_payment_id, amount) values (v_job, v_inst, v_pay2, 4000);
  perform _assert((select payment_run from installer_payouts_due where job_id = v_job) = next_payment_run(current_date),
                  'payout lands in the next Tuesday/Friday run');
  update installer_payouts set paid_on = current_date where job_id = v_job;
  perform _assert((select ready from job_gate_readiness where job_id=v_job and gate='close'), 'job can close');
  perform _assert((select count(*) from job_deadlines where job_id = v_job and status = 'overdue') = 0,
                  'no deadlines overdue on the finished job');

  ---------------------------------------------------------------------
  -- 9. Complaints, non-conformities, security
  ---------------------------------------------------------------------
  insert into complaints (job_id, received_at, complainant_name, complaint, no_heat_or_hot_water)
    values (v_job, '2026-10-09 10:00+01', 'Homeowner', 'No heating', true);
  perform _assert((select acknowledge_by from complaint_deadlines where job_id = v_job) = '2026-10-13', 'acknowledge in 2 working days');
  perform _assert((select visit_by from complaint_deadlines where job_id = v_job) = '2026-10-10 10:00+01', 'no heat => visit within 24 hours');
  perform _assert((select respond_by from complaint_deadlines where job_id = v_job) = '2026-10-28', 'respond in 13 working days');

  insert into nonconformities (raised_on, source, description) values ('2026-09-01', 'mcs_assessment', 'Test NC');
  perform _assert((select plan_due_on from nonconformity_deadlines) = '2026-10-13', 'NC plan due in 6 weeks');

  perform _assert(not exists (select 1 from pg_tables where schemaname = 'public' and not rowsecurity),
                  'row-level security is on for every table');
  perform _assert(not exists (
      select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relkind = 'v'
         and not coalesce(c.reloptions @> array['security_invoker=true'], false)),
    'every view runs with the caller''s permissions');
end $$;

rollback;
