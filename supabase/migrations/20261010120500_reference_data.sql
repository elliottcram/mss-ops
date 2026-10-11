-- =====================================================================
-- Reference data the app needs in production. All of it is editable data.
-- Items marked (CHECK) are assumptions to confirm before relying on them.
-- =====================================================================

-- ---------- settings --------------------------------------------------
insert into settings (key, value, note) values
  ('sound_limit_db', '37.0', 'MCS 020 a) permitted development limit, dB(A) at the assessment position'),
  ('heat_loss_recheck_pct', '15', '(CHECK) % by which final heat loss may exceed the estimate before the unit is flagged for review'),
  ('sound_assessment_stale_months', '6', '(CHECK) MCS 020 a) says re-check neighbours/barriers if installation is delayed but gives no period'),
  ('hies_deposit_cover_pct', '25', 'HIES protects deposits and stage payments up to this % of the contract value...'),
  ('hies_deposit_cover_cap', '5000', '...or this amount in GBP, whichever is lower'),
  ('bus_voucher_months', '3', 'BUS voucher validity for air source heat pumps (Ofgem v5.1)'),
  ('payment_run_days', '2,5', 'Installer payment runs: ISO weekday numbers (2 = Tuesday, 5 = Friday)'),
  ('deadline_warning_days', '7', '(CHECK) Deadlines show as "due soon" this many days ahead'),
  ('amber_check_frequency', 'TBC', 'To decide: how often "periodic" checks happen on amber jobs (P21)'),
  ('ts_reassessment_years', '5', 'Technical Supervisors are reassessed every 5 years');

-- ---------- opening types --------------------------------------------
-- Easy MCS is the master list. (CHECK) every value against Easy MCS; only W3 has been corrected so far.
insert into opening_types (code, category, description, u_value) values
  ('W1',  'window', 'Triple glazing low-E, argon filled, wood/PVC frame', 1.6),
  ('W2',  'window', 'Triple glazing low-E, argon filled, metal frame',    2.0),
  ('W3',  'window', 'Current Building Regulations window, wood/PVC frame', 1.6),  -- Easy MCS value (paper sheet says 2.0)
  ('W4',  'window', 'Double glazing low-E, argon filled, wood/PVC frame', 2.1),
  ('W5',  'window', 'Current Building Regulations window, metal frame',   2.2),
  ('W6',  'window', 'Double glazing low-E, argon filled, metal frame',    2.6),
  ('W7',  'window', 'Standard double glazing, wood/PVC frame',            2.8),
  ('W8',  'window', 'Standard double glazing, metal frame',               3.4),
  ('W9',  'window', 'Single glazing, wood/PVC frame',                     4.8),
  ('W10', 'window', 'Single glazing, metal frame',                        5.7),
  ('D1',  'door',   'High quality door, 50% glazing',                     2.2),
  ('D2',  'door',   'Solid wood door',                                    3.0);

insert into radiator_types (code, description) values
  ('RT1', 'Single convector'),
  ('RT2', 'Single convector / double panel'),
  ('RT3', 'Double convector / double panel'),
  ('RT4', 'Single panel'),
  ('RT5', 'Double panel'),
  ('RT6', 'Triple panel');

-- ---------- barriers (MCS 020 a) step 6 and the MCS calculator) -------
-- Type 1: solid masonry wall, or solid fence >= 18 mm, no gaps, extends >= 1 m each side of unit.
-- Type 2: solid fence < 18 mm, same conditions.
-- Open fences, fences with gaps, and vegetation do NOT count as a barrier.
insert into barrier_types (code, label, barrier_class, note) values
  ('masonry_wall',        'Solid brick / masonry wall',                'type_1', 'Easy MCS "solid mass"'),
  ('fence_closed_18plus', 'Close-board fence, boards 18 mm or thicker', 'type_1', 'No gaps or cracks'),
  ('fence_closed_under18','Close-board fence, boards under 18 mm',      'type_2', 'No gaps or cracks'),
  ('fence_open',          'Open fencing / fence with gaps',            'none',   'Does not count as a barrier'),
  ('vegetation',          'Vegetation',                                'none',   'Does not count as a barrier'),
  ('none',                'No barrier',                                'none',   null);

insert into barrier_attenuation (barrier_class, line_of_sight, attenuation_db) values
  ('type_1', 'no_view',      10),
  ('type_1', 'partial_view',  5),
  ('type_1', 'full_view',     0),
  ('type_2', 'no_view',       5),
  ('type_2', 'partial_view',  2.5),
  ('type_2', 'full_view',     0),
  ('none',   'no_view',       0),
  ('none',   'partial_view',  0),
  ('none',   'full_view',     0);

-- ---------- requirements catalogue ------------------------------------
-- blocks_gate NULL = requested but never blocks. any_of_group = members satisfy each other.
insert into requirements
  (code, label, description, kind, job_type, condition, blocks_gate, any_of_group,
   default_requested_from, auto_check, sort_order) values

-- New build
 ('nb_floor_plans',   'Floor plans (all floors)',        null, 'document', 'new_build', 'always', 'heat_loss', null, 'installer', null, 10),
 ('nb_sections',      'Sections',                        null, 'document', 'new_build', 'always', 'heat_loss', null, 'installer', null, 20),
 ('nb_elevations',    'Elevations',                      'Either elevations or a window schedule is enough', 'document', 'new_build', 'always', 'heat_loss', 'nb_elev_or_windows', 'installer', null, 30),
 ('nb_window_schedule','Window schedule',               null, 'document', 'new_build', 'always', 'heat_loss', 'nb_elev_or_windows', 'installer', null, 31),
 ('nb_sap',           'SAP',                             'U-values can be assumed without it', 'document', 'new_build', 'always', null, 'nb_sap_or_construction', 'installer', null, 40),
 ('nb_construction_notes','Construction notes',          null, 'document', 'new_build', 'always', null, 'nb_sap_or_construction', 'installer', null, 41),
 ('nb_planning',      'Planning and general questions (new build form)', 'Listed/conservation, Building Regs, protected species. Permitted development is completed by the office', 'form', 'new_build', 'always', null, null, 'installer', 'planning', 45),
 ('nb_electrics',     'Electrics for DNO (phase, fuse, supply status; MPAN and cut-out photo once connected)', null, 'form', 'new_build', 'always', 'dno', null, 'installer', 'electrics', 55),
 ('nb_sound_details', 'Noise assessment positions and heat pump location (installer form)', 'Needed before the spec is sent, not before the heat loss', 'form', 'new_build', 'always', 'send_spec', null, 'installer', 'sound_positions', 50),
 ('nb_owner_address', 'Owner''s current residential address', 'Needed for the Ofgem ID check', 'data', 'new_build', 'always', 'bus_application', null, 'homeowner', 'owner_address', 60),

-- Retrofit
 ('rt_survey_floor_plan','Survey floor plan with ceiling heights', 'Created in-house', 'document', 'retrofit', 'always', 'heat_loss', null, 'surveyor', null, 10),
 ('rt_survey_form',   'Completed survey form',           'F20 + room sheet + noise planning, submitted', 'form', 'retrofit', 'always', 'heat_loss', null, 'surveyor', 'survey_submitted', 20),
 ('rt_survey_photos', 'Survey photos',                   null, 'document', 'retrofit', 'always', null, null, 'surveyor', null, 30),
 ('rt_electrics',     'Electrics for DNO (phase, fuse, MPAN, cut-out photo)', null, 'form', 'retrofit', 'always', 'dno', null, 'surveyor', 'electrics', 40),
 ('rt_existing_heating','Existing heating and fuel costs', 'For BUS and uplift allowances', 'form', 'retrofit', 'always', 'bus_application', null, 'surveyor', 'existing_heating', 50),
 ('rt_epc',           'EPC status and year built',       null, 'form', 'retrofit', 'always', 'bus_application', null, 'surveyor', 'epc', 60),

-- Exception: only added after Ofgem fails the homeowner's ID check
 ('x_photo_id',       'Photo ID',        'Added only after a failed ID check', 'document', null, 'id_check_failed', 'bus_application', null, 'homeowner', null, 900),
 ('x_utility_bills',  'Utility bills',   'Added only after a failed ID check', 'document', null, 'id_check_failed', 'bus_application', null, 'homeowner', null, 910);

-- ---------- supervision (MCS supervision guidance, P21) -------------
insert into supervision_matrix (level, risk, colour) values
  ('skilled_qualified','low','green'), ('skilled_qualified','medium','green'), ('skilled_qualified','high','amber'),
  ('skilled','low','green'),           ('skilled','medium','amber'),          ('skilled','high','red'),
  ('supervised','low','amber'),        ('supervised','medium','red'),         ('supervised','high','red');

-- (CHECK) every credential and rule below against the Easy MCS categories.
insert into credential_types (code, label, has_expiry, affects_level, note) values
  ('mcs_hp_award',        'MCS-approved heat pump qualification (e.g. Level 3 Award)', false, true, 'Must be on the MCS approved list'),
  ('nvq2_plumbing',       'NVQ Level 2 Plumbing and Heating',                       false, true, null),
  ('nvq3_plumbing',       'NVQ Level 3 Plumbing and Heating',                       false, true, null),
  ('nvq3_electrical',     'NVQ Level 3 Electrical Installation',                    false, true, null),
  ('equivalent_heating',  'Equivalent heating or electrical qualification',         false, true, 'Office decides equivalence'),
  ('manufacturer_training','Manufacturer training on the product',                  true,  true, null),
  ('unvented_g3',         'Unvented hot water (G3)',                                true,  false, 'Separate competency, does not change level'),
  ('water_regs',          'Water Regulations',                                      true,  false, 'Separate competency, does not change level'),
  ('f_gas',               'F-gas handling (split systems)',                         true,  false, 'Only for F-gas split units'),
  ('electrical_18th',     'BS 7671 18th Edition',                                   false, false, null);

insert into level_rules (level, technology, rule_group, credential_type_code) values
  ('skilled_qualified','air_source_heat_pump','mcs','mcs_hp_award'),
  ('skilled_qualified','air_source_heat_pump','base','nvq2_plumbing'),
  ('skilled_qualified','air_source_heat_pump','base','nvq3_plumbing'),
  ('skilled_qualified','air_source_heat_pump','base','nvq3_electrical'),
  ('skilled','air_source_heat_pump','manufacturer','manufacturer_training'),
  ('skilled','air_source_heat_pump','base','nvq2_plumbing'),
  ('skilled','air_source_heat_pump','base','nvq3_plumbing'),
  ('skilled','air_source_heat_pump','base','nvq3_electrical'),
  ('skilled','air_source_heat_pump','base','equivalent_heating');

-- ---------- milestones --------------------------------------------------
insert into milestone_types (code, label, stage, sort_order) values
  ('quote_sent',                'Quote and estimate sent',                          'enquiry',       10),
  ('quote_accepted',            'Quote accepted',                                   'enquiry',       20),
  ('consultancy_invoice_paid',  'Consultancy invoice paid',                         'enquiry',       30),
  ('welcome_email_sent',        'Welcome email and homeowner form sent',            'job_setup',     10),
  ('survey_booked',             'Survey booked',                                    'job_setup',     20),
  ('drawings_requested',        'Drawings and short form requested',                'job_setup',     30),
  ('easymcs_project_setup',     'Toolkit project set up in Easy MCS',               'design',        10),
  ('spec_complete',             'Heat pump, cylinder and emitters specified',       'design',        20),
  ('pricing_requested',         'Pricing link sent to the installer',               'contract',      10),
  ('performance_estimate_uploaded','MCS 031 estimate uploaded to the proposal pack','contract',      20),
  ('proposal_pack_complete',    'Proposal pack complete in Easy MCS',               'contract',      30),
  ('contract_sent',             'Proposal pack and contract sent (Adobe Sign)',     'contract',      40),
  ('contract_signed',           'Contract signed',                                  'contract',      50),
  ('installation_invoice_raised','Installation invoice raised in Sage',            'contract',      60),
  ('method_statement_issued',   'Method statement (F29) issued',                    'installation',  10),
  ('risk_assessment_received',  'Subcontractor risk assessment received',           'installation',  20),
  ('install_started',           'Installation started',                             'installation',  30),
  ('install_completed',         'Installer confirmed the install is finished',      'installation',  40),
  ('commissioning_booked',      'Commissioning visit booked',                       'commissioning', 10),
  ('pre_visit_docs_received',   'Documents for the engineer received (e.g. EIC)',   'commissioning', 20),
  ('commissioned',              'Commissioned',                                     'commissioning', 30),
  ('hp_commissioning_sheet',    'Heat pump commissioning sheet (F26A) complete',    'commissioning', 40),
  ('cylinder_commissioning_sheet','Cylinder commissioning sheet (F26) complete',    'commissioning', 50),
  ('ts_commissioning_signoff',  'Technical Supervisor signed off commissioning',    'commissioning', 60),
  ('switched_on',               'Heat pump switched on',                            'commissioning', 70),
  ('napit_notified',            'NAPIT notification (Building Regulations)',        'certification', 20),
  ('mcs_certificate_issued',    'MCS certificate issued',                           'certification', 30),
  ('handover_items_received',   'Installer handover items received',                'certification', 40),
  ('handover_sent',             'Handover sent to homeowner (installer copied)',    'closing',       10),
  ('waste_removed',             'Waste removed',                                    'closing',       20);

-- ---------- photo checkpoints (CHECK: build from the engineer's tick sheet) --
insert into checkpoint_types (code, label, what_to_photograph, install_stage, required_for, audit_item, sort_order) values
  ('existing_system', 'Existing heating before removal', 'Heat source, make and model plate, and where it is', 'before', '{green,amber,red}', true, 10),
  ('unit_position',   'Unit position and mounting',     'Unit in place with clearances, base or brackets', 'external', '{green,amber,red}', false, 20),
  ('pipework',        'Pipework and insulation',        'Insulation on all external pipework (UV-stable outside)', 'pipework', '{amber,red}', true, 30),
  ('cylinder',        'Cylinder',                       'Cylinder installed, discharge pipework and labels', 'cylinder', '{amber,red}', false, 40),
  ('electrics',       'Electrics',                      'Isolator, supply cable and consumer unit', 'electrics', '{red}', false, 50),
  ('filling',         'Filling and pressure test',      'Pressure gauge, filling loop disconnected and capped', 'commissioning', '{amber,red}', true, 60),
  ('controls',        'Controls',                       'Controller and thermostat locations', 'controls', '{red}', false, 70);

-- ---------- chase rules (draft 10 October 2026, finalise later) -----------
insert into chase_rules (code, plan_ref, label, stage, chase_party, clock_event, start_offset_days,
                         repeat_every_days, escalate_after_days, escalate_to, sends_email, only_when) values
  ('quote_accepted',     1,  'Quote accepted and consultancy invoice paid', 'enquiry', 'homeowner', 'quote_sent', 7, 7, null, null, true, null),
  ('installer_onboarding',3, 'Installer onboarding',          'job_setup', 'installer', 'consultancy_invoice_paid', 0, 7, 14, 'assignee', true, null),
  ('qualification_renewal',4,'Installer qualification renewal', null,     'installer', 'credential_expires_on', -7, 7, null, null, true, 'Installer has live jobs'),
  ('welcome_form',       5,  'Homeowner welcome form',        'job_setup', 'homeowner', 'consultancy_invoice_paid', 1, null, null, null, true, null),
  ('survey_date',        6,  'Survey date agreed (retrofit)', 'job_setup', 'installer', 'consultancy_invoice_paid', 0, 3, 14, 'office_lead', true, null),
  ('nb_drawings',        7,  'New build drawings',            'survey',    'installer', 'consultancy_invoice_paid', 0, 3, 14, 'office_lead', true, null),
  ('nb_short_form',      8,  'New build short form',          'survey',    'installer', 'consultancy_invoice_paid', 0, 3, 14, 'office_lead', true, null),
  ('survey_not_submitted',9, 'Survey not submitted',          'survey',    null,        'survey_booked', null, null, null, 'office_lead', false, 'Timing to set'),
  ('preferred_make',     10, 'Preferred make',                'design',    'installer', 'heat_loss_started', null, null, null, null, true, 'Only when unknown'),
  ('radiator_choices',   11, 'Radiator choices',              'design',    'installer', 'emitter_link_sent', null, null, null, null, true, 'Only when the installer chooses radiators'),
  ('waiting_heat_loss',  12, 'Job waiting in "ready for heat loss"', 'design', null,    'ready_for_heat_loss', null, null, null, 'admin', false, 'Timing to set'),
  ('installer_spec',     13, 'Installer approves spec',       'approval',  'installer', 'spec_sent', 3, 3, 14, 'assignee', true, null),
  ('homeowner_spec',     14, 'Homeowner approves spec',       'approval',  'homeowner', 'spec_sent', 3, 3, 14, 'assignee', true, null),
  ('installer_pricing',  15, 'Installer pricing',             'contract',  'installer', 'pricing_requested', 3, 3, 14, 'assignee', true, null),
  ('contract_signed',    16, 'Contract signed',               'contract',  'homeowner', 'contract_sent', 2, 2, 7, 'assignee', true, null),
  ('payment_reminder',   17, 'Payment reminder',              null,        'homeowner', 'payment_due_on', -2, 2, 5, 'assignee', true, null),
  ('payment_overdue',    18, 'Payment overdue',               null,        null,        'payment_due_on', 1, null, null, 'admin', false, null),
  ('bus_evidence',       19, 'Further BUS evidence',          'applications', null,     'bus_info_requested', 0, null, null, 'admin', false, null),
  ('id_check_documents', 20, 'ID check documents',            'applications', null,     'id_check_failed', 0, null, null, 'admin', false, null),
  ('hies_day_120',       23, 'HIES deposit cover day-120 warning', null,   null,        'hies_registered', null, null, null, 'admin', false, 'Timing to set'),
  ('voucher_expiry',     24, 'BUS voucher expiry warning',    null,        null,        'voucher_expires_on', null, null, null, 'admin', false, 'Timing to set');

-- ---------- bank holidays, England and Wales (CHECK against gov.uk) --------
insert into bank_holidays (day, name) values
  ('2026-01-01','New Year''s Day'), ('2026-04-03','Good Friday'), ('2026-04-06','Easter Monday'),
  ('2026-05-04','Early May bank holiday'), ('2026-05-25','Spring bank holiday'),
  ('2026-08-31','Summer bank holiday'), ('2026-12-25','Christmas Day'), ('2026-12-28','Boxing Day (substitute)'),
  ('2027-01-01','New Year''s Day'), ('2027-03-26','Good Friday'), ('2027-03-29','Easter Monday'),
  ('2027-05-03','Early May bank holiday'), ('2027-05-31','Spring bank holiday'),
  ('2027-08-30','Summer bank holiday'), ('2027-12-27','Christmas Day (substitute)'), ('2027-12-28','Boxing Day (substitute)');
