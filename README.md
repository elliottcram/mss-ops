# MSS operations tool

The web app MSS uses to run every job through the umbrella scheme, from enquiry to close. It keeps each job MCS, HIES and BUS compliant, chases what's missing, and shows the office what needs doing next.

## What's here so far

`supabase/migrations/` holds the database, applied in filename order:

| File | What it holds |
|---|---|
| `…120000_core.sql` | Jobs, the requirements catalogue, the survey and new-build form, the MCS 020 a) sound check, the audit log |
| `…120100_installers_supervision.sql` | Installer onboarding, operatives, the credentials register, operative levels and the MCS supervision colour |
| `…120200_pipeline.sql` | Spec versions and approvals, quote and money, HIES / DNO / BUS, milestones, photo checkpoints, remedials, chase rules, complaints, non-conformities |
| `…120300_gates_deadlines.sql` | The ten gates ("can this happen yet?"), the combined list of what's missing, and every legal or scheme deadline |
| `…120400_security.sql` | Row-level security: only signed-in, active staff can read or write |
| `…120500_reference_data.sql` | Settings, Easy MCS lookups, requirements, supervision matrix, milestones, checkpoints, draft chase rules, bank holidays |

`supabase/tests/` holds the self-checking tests.

## Running the tests

```
npm install
npm run test:db
```

This runs every migration and test on a throwaway in-memory Postgres. No Supabase account needed.

## How the rules work

- **Rules are data, not code.** Requirements, chase rules, milestones, checkpoints, credential rules and settings are all rows the office can change.
- **Gates.** Each gate is ready when every requirement that blocks it is met and every computed check passes. `job_gate_readiness` gives yes/no per gate; `job_gaps` lists what's missing, who to ask, and which gate it blocks.
- **Deadlines.** `job_deadlines` lists every clock that has started on a job (HIES 7 days, BUS consent 14/28 days, voucher expiry, MCS certificate 30 days, and so on) with done / due soon / overdue.
- **Audit.** Every change to a job is written to `event_log` with who made it: a person, a bot or an emailed link.

## Things to check (marked CHECK in the files)

- Every window/door U-value against Easy MCS (only W3 has been corrected so far).
- The credentials that make each operative level, against the Easy MCS categories.
- Which photo checkpoints each supervision colour needs (from the engineer's tick sheet).
- Bank holiday dates, against gov.uk.
- Chase timings still to set: 9, 12, 21, 22, 23, 24 and 25 to 32.
- Decisions still open: how often "periodic" checks happen on amber jobs; whether the lead operative sets a job's level; which DNO responses hold the install itself.

## Still to build

- The Next.js app (sign-in, pipeline home, intake form, job page with checklist and gaps).
- File storage for uploads and photos.
- Emailed no-account links for installers and homeowners (checked by the server, written with the service role).
- Finer per-role access (for example, surveyors seeing only their jobs). Any new table also needs row-level security switched on.
- Survey additions: fabric, BS EN 12831 inputs and the ENA electrics questions.
