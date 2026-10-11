'use server'

import { refresh } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Stage } from '@/lib/labels'

// Every action runs as the signed-in person, so row-level security applies
// and the audit log records who did it. Problems go back to the job page as
// a message rather than an error screen.

function fail(jobId: string, message: string): never {
  redirect(`/jobs/${jobId}?error=${encodeURIComponent(message)}`)
}

export async function setStage(jobId: string, f: FormData) {
  const stage = String(f.get('stage')) as Stage
  const supabase = await createClient()
  const { error } = await supabase.from('jobs').update({ stage }).eq('id', jobId)
  if (error) fail(jobId, error.message)
  refresh()
}

export async function setRequirement(jobId: string, jobRequirementId: string, status: 'received' | 'waived' | 'missing') {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const { error } = await supabase
    .from('job_requirements')
    .update({
      status,
      received_at: status === 'received' ? now : null,
      received_via: status === 'received' ? 'manual' : null,
      waived_reason: status === 'waived' ? 'Not needed for this job' : null,
    })
    .eq('id', jobRequirementId)
  if (error) fail(jobId, error.message)
  refresh()
}

export async function tickMilestone(jobId: string, code: string, f: FormData) {
  const doneOn = String(f.get('done_on') || '') || new Date().toISOString().slice(0, 10)
  const reference = String(f.get('reference') ?? '').trim() || null
  const supabase = await createClient()
  const { error } = await supabase.from('job_milestones').insert({ job_id: jobId, milestone_code: code, done_on: doneOn, reference })
  if (error) fail(jobId, error.message)
  refresh()
}

export async function untickMilestone(jobId: string, code: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('job_milestones').delete().eq('job_id', jobId).eq('milestone_code', code)
  if (error) fail(jobId, error.message)
  refresh()
}

export async function putOnHold(jobId: string, f: FormData) {
  const reason = String(f.get('reason') ?? '').trim()
  const review = String(f.get('review_on') ?? '')
  if (!reason || !review) fail(jobId, 'Give a reason and a date to look at it again.')
  const supabase = await createClient()
  const { error } = await supabase.from('jobs').update({ on_hold_reason: reason, on_hold_review_on: review }).eq('id', jobId)
  if (error) fail(jobId, error.message)
  refresh()
}

export async function releaseHold(jobId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('jobs').update({ on_hold_reason: null, on_hold_review_on: null }).eq('id', jobId)
  if (error) fail(jobId, error.message)
  refresh()
}
