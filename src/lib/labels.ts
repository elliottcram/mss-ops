import type { Database } from '@/lib/database.types'

export type Stage = Database['public']['Enums']['job_stage']
export type Gate = Database['public']['Enums']['gate']
export type PartyRole = Database['public']['Enums']['party_role']

export const STAGES: { value: Stage; label: string; short: string }[] = [
  { value: 'enquiry', label: '0. Enquiry and quote', short: 'Enquiry' },
  { value: 'job_setup', label: '1. Job setup', short: 'Setup' },
  { value: 'survey', label: '2. Survey or drawings', short: 'Survey' },
  { value: 'design', label: '3. Heat loss and spec', short: 'Heat loss' },
  { value: 'approval', label: '4. Approval', short: 'Approval' },
  { value: 'contract', label: '5. Proposal and contract', short: 'Contract' },
  { value: 'applications', label: '6. HIES, DNO and BUS', short: 'Applications' },
  { value: 'installation', label: '7. Installation', short: 'Install' },
  { value: 'commissioning', label: '8. Commissioning', short: 'Commissioning' },
  { value: 'certification', label: '9. Certificates', short: 'Certificates' },
  { value: 'closing', label: '10. Handover and close', short: 'Closing' },
  { value: 'closed', label: 'Closed', short: 'Closed' },
]

export const stageLabel = (s: Stage | null | undefined) =>
  STAGES.find((x) => x.value === s)?.label ?? '—'
export const stageShort = (s: Stage | null | undefined) =>
  STAGES.find((x) => x.value === s)?.short ?? '—'

export const GATES: { value: Gate; label: string }[] = [
  { value: 'setup_complete', label: 'Setup complete' },
  { value: 'heat_loss', label: 'Ready for heat loss' },
  { value: 'send_spec', label: 'Spec can be sent' },
  { value: 'contract', label: 'Contract can be sent' },
  { value: 'dno', label: 'DNO application can go in' },
  { value: 'bus_application', label: 'BUS application can go in' },
  { value: 'ready_to_install', label: 'Ready to install' },
  { value: 'switch_on', label: 'Heat pump can be switched on' },
  { value: 'certification', label: 'MCS certificate can be issued' },
  { value: 'close', label: 'Job can close' },
]
export const gateLabel = (g: Gate | null | undefined) =>
  GATES.find((x) => x.value === g)?.label ?? '—'

// The gate that decides whether a job at this stage can move on.
export const NEXT_GATE: Record<Stage, Gate | null> = {
  enquiry: 'setup_complete',
  job_setup: 'setup_complete',
  survey: 'heat_loss',
  design: 'send_spec',
  approval: 'contract',
  contract: 'contract',
  applications: 'ready_to_install',
  installation: 'certification',
  commissioning: 'certification',
  certification: 'certification',
  closing: 'close',
  closed: null,
}

export const WHO: Record<PartyRole, string> = {
  installer: 'From the installer',
  homeowner: 'From the homeowner',
  main_contractor: 'From the main contractor',
  surveyor: 'Our surveyors',
  internal: 'MSS office',
}

export const JOB_TYPE: Record<string, string> = { retrofit: 'Retrofit', new_build: 'New build' }

export function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/London' })
}

export function formatAddress(a: {
  line1?: string | null; line2?: string | null; town?: string | null; postcode?: string | null; plot_or_site_name?: string | null
} | null | undefined) {
  if (!a) return ''
  return [a.plot_or_site_name, a.line1, a.line2, a.town, a.postcode].filter(Boolean).join(', ')
}
