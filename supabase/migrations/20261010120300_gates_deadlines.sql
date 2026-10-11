-- =====================================================================
-- Gates and deadlines.
-- A gate is ready when every requirement unit that blocks it is met AND
-- every computed check for it passes. Both feed one "what's missing" list.
-- =====================================================================

-- Facts about a job that several checks need, worked out once.
create view job_facts with (security_invoker = true) as
select j.*,
       coalesce((select array_agg(milestone_code) from job_milestones m where m.job_id = j.id), '{}') as milestones,
       milestone_on(j.id, 'contract_signed') as contract_signed_on,
       io.missing  as installer_missing,
       js.colour   as supervision_colour,
       js.lead_level,
       js.supervised_without_skilled,
       cs.version  as spec_version, cs.id as spec_version_id, cs.approved as spec_approved,
       cs.heat_loss_pdf_url,
       sc.final_unit_passes,
       h.registered_on as hies_registered_on, h.completion_entered_on as hies_completion_on,
       h.guarantee_sent_on,
       b.voucher_issued_on, b.voucher_expires_on, b.redeemed_on as bus_redeemed_on,
       d.approved_on as dno_approved_on, d.approval_needed_before_install as dno_needed_before_install,
       m.scheduled_total, m.all_paid
from jobs j
left join installer_onboarding io on io.installer_id = j.installer_id
left join job_supervision js on js.job_id = j.id
left join job_current_spec cs on cs.job_id = j.id
left join job_sound_check sc on sc.job_id = j.id
left join hies_registrations h on h.job_id = j.id
left join job_bus b on b.job_id = j.id
left join job_dno d on d.job_id = j.id
left join job_money m on m.job_id = j.id;

-- Every computed check. applies = false means it doesn't count for this job.
create view job_gate_checks with (security_invoker = true) as
select f.id as job_id, c.gate, c.code, c.label, c.requested_from,
       coalesce(c.met, false) as met   -- unknown counts as not met
from job_facts f
cross join lateral (values
  -- Stage 1 -> 2
  ('setup_complete'::gate, 'job_type', 'Job type (retrofit or new build)', 'internal'::party_role,
     f.job_type is not null, true),
  ('setup_complete', 'installer', 'Installer chosen', 'internal', f.installer_id is not null, true),
  ('setup_complete', 'survey_booked', 'Survey booked', 'internal',
     'survey_booked' = any (f.milestones), f.job_type = 'retrofit'),
  ('setup_complete', 'drawings_requested', 'Drawings request sent', 'internal',
     'drawings_requested' = any (f.milestones), f.job_type = 'new_build'),

  -- Stage 3 -> 4: spec can be sent
  ('send_spec', 'heat_loss_entered', 'Total heat loss entered', 'internal',
     f.final_heat_loss_kw is not null, true),
  ('send_spec', 'spec_complete', 'Heat pump, cylinder and emitters specified', 'internal',
     'spec_complete' = any (f.milestones) and f.final_unit_id is not null, true),
  ('send_spec', 'sound_passes', 'Sound check passes for the chosen unit', 'internal',
     coalesce(f.final_unit_passes, false), true),
  ('send_spec', 'heat_loss_pdf', 'Heat loss calculation attached to the spec', 'internal',
     f.heat_loss_pdf_url is not null, true),

  -- Stage 5: proposal pack and contract can go out
  ('contract', 'spec_approved', 'Installer and homeowner approved the current spec', 'internal',
     coalesce(f.spec_approved, false), true),
  ('contract', 'installer_price', 'Installer price for the current spec', 'installer',
     exists (select 1 from installer_prices ip where ip.job_id = f.id
               and ip.spec_version_id = f.spec_version_id), true),
  ('contract', 'performance_estimate', 'MCS 031 estimate uploaded to the proposal pack', 'internal',
     'performance_estimate_uploaded' = any (f.milestones), true),
  ('contract', 'quote_figures', 'Quote reference, date, totals and heat pump cost', 'internal',
     f.quote_ref is not null and f.quote_date is not null and f.quote_total_before_grant is not null
     and f.heat_pump_cost is not null and f.contract_value is not null
     and (not f.uses_bus_grant or f.bus_grant_amount is not null), true),
  ('contract', 'schedule_matches', 'Payment schedule adds up to the contract value', 'internal',
     f.contract_value is not null and f.scheduled_total = f.contract_value, true),
  ('contract', 'proposal_pack', 'Every proposal pack document complete in Easy MCS', 'internal',
     'proposal_pack_complete' = any (f.milestones), true),

  -- Stage 6
  ('dno', 'unit_chosen', 'Heat pump model chosen (the new device)', 'internal',
     f.final_unit_id is not null, true),
  ('bus_application', 'contract_signed', 'Contract signed', 'homeowner',
     f.contract_signed_on is not null, f.uses_bus_grant),
  ('bus_application', 'quote_figures', 'Quote figures for Ofgem', 'internal',
     f.quote_ref is not null and f.quote_date is not null and f.quote_total_before_grant is not null
     and f.heat_pump_cost is not null and f.bus_grant_amount is not null, f.uses_bus_grant),

  -- Stage 7: can this job be installed?
  ('ready_to_install', 'installer_onboarded', 'Installer fully onboarded', 'installer',
     f.installer_id is not null and cardinality(f.installer_missing) = 0, true),
  ('ready_to_install', 'contract_signed', 'Proposal pack complete and contract signed', 'homeowner',
     f.contract_signed_on is not null and 'proposal_pack_complete' = any (f.milestones), true),
  ('ready_to_install', 'hies_registered', 'HIES registration made', 'internal',
     f.hies_registered_on is not null, true),
  ('ready_to_install', 'voucher_valid', 'BUS voucher issued and in date for the install', 'internal',
     f.voucher_issued_on is not null
     and f.voucher_expires_on > coalesce(f.planned_install_finish, f.planned_install_start, current_date),
     f.uses_bus_grant),
  ('ready_to_install', 'cooling_off', 'Cooling-off ended, or express consent (F08B) signed', 'homeowner',
     f.express_consent_signed_on is not null
     or coalesce(f.planned_install_start, current_date) > f.contract_signed_on + 14, true),
  ('ready_to_install', 'operatives', 'Operatives named, with a lead and their level', 'installer',
     f.lead_level is not null and not coalesce(f.supervised_without_skilled, false), true),
  ('ready_to_install', 'risk', 'Risk level set with reasoning, and supervision colour', 'internal',
     f.supervision_colour is not null and f.risk_reasoning is not null, true),
  ('ready_to_install', 'method_statement', 'Method statement (F29) issued', 'internal',
     'method_statement_issued' = any (f.milestones), f.supervision_colour in ('amber','red')),
  ('ready_to_install', 'risk_assessment', 'Subcontractor risk assessment for this installation', 'installer',
     'risk_assessment_received' = any (f.milestones), true),
  ('ready_to_install', 'dno_before_install', 'DNO approval (needed before installation on this job)', 'internal',
     f.dno_approved_on is not null, coalesce(f.dno_needed_before_install, false)),

  -- Stage 8: switch-on waits for the DNO
  ('switch_on', 'dno_approved', 'DNO approved, or confirmed we can connect', 'internal',
     f.dno_approved_on is not null, true),

  -- Stage 8 -> 9: MCS certificate
  ('certification', 'install_completed', 'Installer confirmed the install is finished', 'installer',
     'install_completed' = any (f.milestones), true),
  ('certification', 'checkpoints', 'Every required photo checkpoint accepted', 'installer',
     not exists (select 1 from job_checkpoint_status s where s.job_id = f.id and not s.accepted), true),
  ('certification', 'hp_sheet', 'Heat pump commissioning sheet (F26A)', 'internal',
     'hp_commissioning_sheet' = any (f.milestones), true),
  ('certification', 'cylinder_sheet', 'Cylinder commissioning sheet (F26)', 'internal',
     'cylinder_commissioning_sheet' = any (f.milestones), f.has_cylinder),
  ('certification', 'ts_signoff', 'Technical Supervisor signed off commissioning', 'internal',
     'ts_commissioning_signoff' = any (f.milestones), true),
  ('certification', 'remedials', 'Every remedial accepted', 'installer',
     not exists (select 1 from remedials r where r.job_id = f.id and r.accepted_on is null), true),
  ('certification', 'hies_completion', 'HIES completion entered', 'internal',
     f.hies_completion_on is not null, true),
  ('certification', 'napit', 'NAPIT notification done', 'internal',
     'napit_notified' = any (f.milestones), true),

  -- Stage 10: close
  ('close', 'mcs_certificate', 'MCS certificate issued', 'internal',
     'mcs_certificate_issued' = any (f.milestones), true),
  ('close', 'handover_items', 'Installer handover items received', 'installer',
     'handover_items_received' = any (f.milestones), true),
  ('close', 'handover_sent', 'Handover sent to the homeowner', 'internal',
     'handover_sent' = any (f.milestones), true),
  ('close', 'guarantee_sent', 'Workmanship guarantee sent', 'internal',
     f.guarantee_sent_on is not null, true),
  ('close', 'bus_redeemed', 'BUS voucher redeemed', 'internal',
     f.bus_redeemed_on is not null, f.uses_bus_grant),
  ('close', 'homeowner_paid', 'All homeowner payments received', 'homeowner',
     coalesce(f.all_paid, false), true),
  ('close', 'installer_paid', 'Installer paid', 'internal',
     exists (select 1 from installer_payouts p where p.job_id = f.id)
     and not exists (select 1 from installer_payouts p where p.job_id = f.id and p.paid_on is null), true),
  ('close', 'dno_approved', 'DNO approved or notified', 'internal',
     f.dno_approved_on is not null, true)
) as c(gate, code, label, requested_from, met, applies)
where coalesce(c.applies, false);

create view job_gate_readiness with (security_invoker = true) as
select j.id as job_id, j.job_ref, g.gate,
       (select count(*) from job_requirement_units u
         where u.job_id = j.id and u.blocks_gate = g.gate and not u.is_met)
     + (select count(*) from job_gate_checks c
         where c.job_id = j.id and c.gate = g.gate and not c.met) as unmet,
       (j.job_type is not null
        and not exists (select 1 from job_requirement_units u
                         where u.job_id = j.id and u.blocks_gate = g.gate and not u.is_met)
        and not exists (select 1 from job_gate_checks c
                         where c.job_id = j.id and c.gate = g.gate and not c.met)) as ready
from jobs j
cross join (select unnest(enum_range(null::gate)) as gate) g;

-- What is still missing, who to ask, and what it blocks.
create view job_gaps with (security_invoker = true) as
select u.job_id, u.label, u.requested_from, u.blocks_gate,
       (u.blocks_gate is not null) as blocking, 'requirement'::text as source, u.sort_order
from job_requirement_units u
where not u.is_met
union all
select c.job_id, c.label, c.requested_from, c.gate, true, 'check', 1000
from job_gate_checks c
where not c.met;

-- ---------- deadlines --------------------------------------------------
-- One row per legal / scheme deadline that has started on a job.
create view job_deadlines with (security_invoker = true) as
with f as (select * from job_facts),
d as (
  select f.id as job_id, x.code, x.label, x.due_on, x.done_on, x.source
  from f
  left join job_bus b on b.job_id = f.id
  cross join lateral (values
    ('hies_register', 'Register with HIES (7 days from contract)',
       f.contract_signed_on + 7, f.hies_registered_on, 'HIES H1.1'),
    ('hies_deposit_cover', 'HIES deposit cover ends (120 days from registration)',
       f.hies_registered_on + 120, milestone_on(f.id, 'install_completed'), 'HIES'),
    ('bus_consent', 'Homeowner consents to Ofgem',
       b.consent_requested_on + case when b.assisted_digital then 28 else 14 end,
       b.consent_given_on, 'BUS v5.1'),
    ('bus_info_request', 'Respond to Ofgem information request',
       b.info_requested_on + 14, b.info_responded_on, 'BUS v5.1'),
    ('bus_voucher', 'Redeem BUS voucher before it expires',
       b.voucher_expires_on, b.redeemed_on, 'BUS v5.1'),
    ('bus_apply_after_commissioning', 'Apply for BUS within 120 days of commissioning',
       case when f.uses_bus_grant and (b.applied_on is null
                 or b.applied_on > milestone_on(f.id, 'commissioned'))
            then milestone_on(f.id, 'commissioned') + 120 end,
       case when b.applied_on <= milestone_on(f.id, 'commissioned') + 120 then b.applied_on end,
       'BUS v5.1'),
    ('mcs_certificate', 'MCS certificate (30 days from commissioning)',
       milestone_on(f.id, 'commissioned') + 30, milestone_on(f.id, 'mcs_certificate_issued'), 'MCS IOR'),
    ('homeowner_documents', 'Homeowner has MCS cert, Building Regs cert and DNO proof (30 days from completion)',
       milestone_on(f.id, 'install_completed') + 30, milestone_on(f.id, 'handover_sent'), 'MCS Customer Commitment'),
    ('hies_completion', 'Enter HIES completion date (7 days from completion)',
       milestone_on(f.id, 'install_completed') + 7, f.hies_completion_on, 'HIES H2.5'),
    ('workmanship_guarantee', 'Send workmanship guarantee (7 days from completion)',
       milestone_on(f.id, 'install_completed') + 7, f.guarantee_sent_on, 'HIES H2.1'),
    ('waste_removed', 'Waste removed (7 days from completion)',
       milestone_on(f.id, 'install_completed') + 7, milestone_on(f.id, 'waste_removed'), 'HIES')
  ) as x(code, label, due_on, done_on, source)
  where x.due_on is not null
)
select d.*,
       case when d.done_on is not null then 'done'
            when d.due_on < current_date then 'overdue'
            when d.due_on <= current_date + (select value::int from settings where key = 'deadline_warning_days')
              then 'due_soon'
            else 'open' end as status,
       d.due_on - current_date as days_left
from d;
