import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { NEXT_GATE, type Gate, type Stage, type PartyRole, formatAddress } from '@/lib/labels'

export type Look = 'overdue' | 'needed' | 'ready' | 'hold'

export type JobRow = {
  id: string
  ref: string
  type: string | null
  stage: Stage
  homeowner: string | null
  address: string
  installer: string | null
  nextGate: Gate | null
  nextMissing: { label: string; from: PartyRole | null }[]
  overdue: { label: string; due_on: string }[]
  dueSoon: { label: string; due_on: string }[]
  look: Look
  holdReason: string | null
  updatedAt: string
}

// Everything the home screen needs, in four queries, worked out per job.
export async function getJobRows(): Promise<JobRow[]> {
  const supabase = await createClient()
  const [jobs, gates, gaps, deadlines] = await Promise.all([
    supabase
      .from('jobs')
      .select(`id, job_ref, job_type, stage, homeowner_name, on_hold_reason, cancelled_at, updated_at,
               install_address:addresses!jobs_install_address_id_fkey(line1, line2, town, postcode, plot_or_site_name),
               installer:installers(name)`)
      .is('cancelled_at', null)
      .order('updated_at', { ascending: false }),
    supabase.from('job_gate_readiness').select('job_id, gate, ready'),
    supabase.from('job_gaps').select('job_id, label, requested_from, blocks_gate, blocking, sort_order').eq('blocking', true),
    supabase.from('job_deadlines').select('job_id, label, due_on, status').in('status', ['overdue', 'due_soon']),
  ])
  for (const r of [jobs, gates, gaps, deadlines]) if (r.error) throw new Error(r.error.message)

  return (jobs.data ?? []).map((j) => {
    const nextGate = NEXT_GATE[j.stage]
    const ready = gates.data!.find((g) => g.job_id === j.id && g.gate === nextGate)?.ready ?? false
    const nextMissing = gaps.data!
      .filter((g) => g.job_id === j.id && g.blocks_gate === nextGate)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((g) => ({ label: g.label ?? '', from: g.requested_from }))
    const mine = deadlines.data!.filter((d) => d.job_id === j.id)
    const overdue = mine.filter((d) => d.status === 'overdue').map((d) => ({ label: d.label!, due_on: d.due_on! }))
    const dueSoon = mine.filter((d) => d.status === 'due_soon').map((d) => ({ label: d.label!, due_on: d.due_on! }))
    const look: Look = j.on_hold_reason ? 'hold' : overdue.length ? 'overdue' : ready || !nextGate ? 'ready' : 'needed'
    return {
      id: j.id,
      ref: j.job_ref,
      type: j.job_type,
      stage: j.stage,
      homeowner: j.homeowner_name,
      address: formatAddress(j.install_address),
      installer: j.installer?.name ?? null,
      nextGate,
      nextMissing,
      overdue,
      dueSoon,
      look,
      holdReason: j.on_hold_reason,
      updatedAt: j.updated_at,
    }
  })
}

export async function getInstallers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('installers')
    .select('id, name, contact_name, email, phone, default_manufacturer_id, active')
    .order('name')
  if (error) throw new Error(error.message)
  return data
}

export async function getManufacturers() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('manufacturers').select('id, name').order('name')
  if (error) throw new Error(error.message)
  return data
}
