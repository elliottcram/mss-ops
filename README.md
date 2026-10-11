# MSS operations tool

The web app MSS uses to run every job through the umbrella scheme, from enquiry to close. It keeps each job MCS, HIES and BUS compliant, chases what's missing, and shows the office what needs doing next.

## The app

A Next.js 16 app (`src/`) on top of the Supabase database. Staff sign in with their Microsoft 365 work account, so Microsoft's MFA applies. An email-and-password sign-in is kept as a fallback for now.

| Page | What it does |
|---|---|
| `/` | Every live job, worst first: deadline missed, still needed, ready to move on, on hold. Counts at the top double as filters. |
| `/jobs/new` | The intake form. Only the job reference is required; new-build questions appear only for new builds. |
| `/jobs/[id]` | One job: what's still needed (tick "Got it" or "Not needed"), steps done with dates, the ten "can it move on?" gates, deadlines, details, hold, and who changed what. |
| `/installers` | Installers and their onboarding checklist, plus the list of heat pump makes. |

To run it locally, copy `.env.example` to `.env.local`, fill in the Supabase URL and publishable key, then `npm install` and `npm run dev`.

### Adding a member of staff

Add a row to the `staff` table with their work email. The first time they sign in with Microsoft, the app links their account to that row. Anyone without a staff row can sign in but sees nothing.

## The database

`supabase/migrations/` holds the database, applied in filename order (all applied to the live project):

| File | What it holds |
|---|---|
| `…120000_core.sql` | Jobs, the requirements catalogue, the survey and new-build form, the MCS 020 a) sound check, the audit log |
| `…120100_installers_supervision.sql` | Installer onboarding, operatives, the credentials register, operative levels and the MCS supervision colour |
| `…120200_pipeline.sql` | Spec versions and approvals, quote and money, HIES / DNO / BUS, milestones, photo checkpoints, remedials, chase rules, complaints, non-conformities |
| `…120300_gates_deadlines.sql` | The ten gates ("can this happen yet?"), the combined list of what's missing, and every legal or scheme deadline |
| `…120400_security.sql` | Row-level security: only signed-in, active staff can read or write |
| `…120500_reference_data.sql` | Settings, Easy MCS lookups, requirements, supervision matrix, milestones, checkpoints, draft chase rules, bank holidays |
| `20261011120000_hardening.sql` | Fixes from Supabase's security and performance checks |
| `20261011130000_actor_from_session.sql` | The audit log names the signed-in member of staff |
| `20261011140000_link_staff_on_microsoft_signin.sql` | A first Microsoft sign-in links to the staff row with the same email |

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

- Editing a job's details after intake, and the stage 3 to 10 screens (spec, money, HIES/DNO/BUS, photos).
- Sending requests and chasers by email.
- File storage for uploads and photos.
- Emailed no-account links for installers and homeowners (checked by the server, written with the service role).
- Finer per-role access (for example, surveyors seeing only their jobs). Any new table also needs row-level security switched on.
- Survey additions: fabric, BS EN 12831 inputs and the ENA electrics questions.
