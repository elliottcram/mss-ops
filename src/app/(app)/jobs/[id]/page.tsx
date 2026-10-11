import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import {
  GATES, JOB_TYPE, NEXT_GATE, STAGES, WHO, formatAddress, formatDate, stageLabel, type Stage,
} from '@/lib/labels'
import { putOnHold, releaseHold, setRequirement, setStage, tickMilestone, untickMilestone } from './actions'

export default function JobPage({ params, searchParams }: PageProps<'/jobs/[id]'>) {
  return (
    <main className="main">
      <Suspense fallback={<div className="card"><p className="hint">Loading the job…</p></div>}>
        <Job params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  )
}

async function Job({ params, searchParams }: Pick<PageProps<'/jobs/[id]'>, 'params' | 'searchParams'>) {
  const { id } = await params
  const sp = await searchParams
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()
  const supabase = await createClient()

  const [jobRes, gatesRes, gapsRes, reqRes, msTypesRes, msRes, dlRes, logRes] = await Promise.all([
    supabase.from('jobs').select(`*,
        install_address:addresses!jobs_install_address_id_fkey(line1, line2, town, postcode, plot_or_site_name),
        owner_address:addresses!jobs_owner_residential_address_id_fkey(line1, line2, town, postcode),
        installer:installers(id, name, email),
        manufacturer:manufacturers(name),
        assignee:staff!jobs_assignee_id_fkey(name)`).eq('id', id).maybeSingle(),
    supabase.from('job_gate_readiness').select('gate, ready, unmet').eq('job_id', id),
    supabase.from('job_gaps').select('label, requested_from, blocks_gate, blocking, sort_order').eq('job_id', id),
    supabase.from('job_requirements')
      .select('id, status, received_at, requirement:requirements(label, description, blocks_gate, any_of_group, default_requested_from, auto_check, sort_order)')
      .eq('job_id', id),
    supabase.from('milestone_types').select('code, label, stage, sort_order').order('sort_order'),
    supabase.from('job_milestones').select('milestone_code, done_on, reference').eq('job_id', id),
    supabase.from('job_deadlines').select('code, label, due_on, done_on, status, days_left, source').eq('job_id', id).order('due_on'),
    supabase.from('event_log').select('id, at, entity, action, actor_kind, actor_label, changes').eq('job_id', id).order('at', { ascending: false }).limit(25),
  ])
  if (jobRes.error) throw new Error(jobRes.error.message)
  const job = jobRes.data
  if (!job) notFound()

  const nextGate = NEXT_GATE[job.stage]
  const gates = gatesRes.data ?? []
  const gaps = gapsRes.data ?? []
  const done = new Map((msRes.data ?? []).map((m) => [m.milestone_code, m]))
  const reqs = (reqRes.data ?? [])
    .filter((r) => r.requirement)
    .sort((a, b) => (a.requirement!.sort_order ?? 0) - (b.requirement!.sort_order ?? 0))
  const today = new Date().toISOString().slice(0, 10)
  const error = typeof sp.error === 'string' ? sp.error : null

  return (
    <>
      <div className="job-head">
        <div>
          <div className="crumbs"><Link href="/">Jobs</Link> / {job.job_ref}</div>
          <h1>{job.job_ref}{job.homeowner_name ? ` · ${job.homeowner_name}` : ''}</h1>
          <p className="hint" style={{ marginTop: 4 }}>
            {formatAddress(job.install_address) || 'No address yet'} · {job.job_type ? JOB_TYPE[job.job_type] : 'Type not set'}
          </p>
        </div>
        <form action={setStage.bind(null, job.id)} className="filters">
          <label htmlFor="stage" className="strong" style={{ fontSize: 16 }}>Stage</label>
          <select id="stage" name="stage" defaultValue={job.stage} className="select" style={{ width: 250 }}>
            {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button className="btn secondary" type="submit">Move</button>
        </form>
      </div>

      {sp.created === '1' && <div className="banner ok" role="status">Job created. Below is everything still needed, and who to ask.</div>}
      {error && <div className="banner error" role="alert">{error}</div>}
      {job.on_hold_reason && (
        <div className="banner info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <span><strong>On hold:</strong> {job.on_hold_reason}. Look again on {formatDate(job.on_hold_review_on)}.</span>
          <form action={releaseHold.bind(null, job.id)}><button className="btn secondary small" type="submit">Take off hold</button></form>
        </div>
      )}

      <div className="cols">
        <div className="stack">
          {/* What's needed */}
          <section className="card">
            <div className="card-head">
              <h2>What’s needed</h2>
              <span className="hint">{reqs.filter((r) => r.status === 'missing' || r.status === 'requested').length} still to come in</span>
            </div>
            {!job.job_type && <div className="banner info">Set the job type (retrofit or new build) to see what’s needed.</div>}
            <ul className="list">
              {reqs.map((r) => {
                const q = r.requirement!
                const isDone = r.status === 'received' || r.status === 'waived'
                return (
                  <li key={r.id} className={`item${isDone ? ' done' : ''}`}>
                    <div>
                      <div className="strong" style={{ fontSize: 16 }}>{q.label}</div>
                      <div className="sub">
                        {q.default_requested_from ? WHO[q.default_requested_from] : ''}
                        {q.blocks_gate ? ` · needed for: ${GATES.find((g) => g.value === q.blocks_gate)?.label.toLowerCase()}` : ' · nice to have'}
                        {q.any_of_group ? ' · either of a pair' : ''}
                        {r.status === 'received' && r.received_at ? ` · in ${formatDate(r.received_at)}` : ''}
                        {r.status === 'waived' ? ' · not needed' : ''}
                        {!isDone && q.auto_check ? ' · ticks itself when the form is in' : ''}
                      </div>
                    </div>
                    <form>
                      {isDone ? (
                        <button className="btn link small" formAction={setRequirement.bind(null, job.id, r.id, 'missing')}>Undo</button>
                      ) : (
                        <>
                          <button className="btn link small" formAction={setRequirement.bind(null, job.id, r.id, 'waived')}>Not needed</button>
                          <button className="btn small" formAction={setRequirement.bind(null, job.id, r.id, 'received')}>Got it</button>
                        </>
                      )}
                    </form>
                  </li>
                )
              })}
            </ul>
          </section>

          {/* Milestones */}
          <section className="card">
            <h2>Steps done</h2>
            <p className="hint">Tick each step as it happens. The date is when it happened, so you can backdate.</p>
            {STAGES.filter((s) => s.value !== 'closed').map((s) => {
              const types = (msTypesRes.data ?? []).filter((t) => t.stage === s.value)
              if (types.length === 0) return null
              const nDone = types.filter((t) => done.has(t.code)).length
              return (
                <details key={s.value} className={`gate${s.value === job.stage ? ' current' : ''}`} open={s.value === job.stage}>
                  <summary>
                    <span>{s.label}</span>
                    <span className={`badge ${nDone === types.length ? 'ok' : 'wait'}`}>{nDone} of {types.length}</span>
                  </summary>
                  <ul className="list" style={{ padding: 12 }}>
                    {types.map((t) => {
                      const m = done.get(t.code)
                      return (
                        <li key={t.code} className={`item${m ? ' done' : ''}`}>
                          <div>
                            <div className="strong" style={{ fontSize: 16 }}>{t.label}</div>
                            {m && <div className="sub">{formatDate(m.done_on)}{m.reference ? ` · ${m.reference}` : ''}</div>}
                          </div>
                          {m ? (
                            <form action={untickMilestone.bind(null, job.id, t.code)}>
                              <button className="btn link small" type="submit">Undo</button>
                            </form>
                          ) : (
                            <form action={tickMilestone.bind(null, job.id, t.code)}>
                              <label className="sr-only" htmlFor={`d-${t.code}`}>Date</label>
                              <input id={`d-${t.code}`} className="input" type="date" name="done_on" defaultValue={today} max={today} style={{ width: 160, height: 40 }} />
                              <button className="btn small" type="submit">Done</button>
                            </form>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </details>
              )
            })}
          </section>
        </div>

        <div className="stack">
          {/* Gates */}
          <section className="card">
            <h2>Can it move on?</h2>
            {GATES.map((g) => {
              const st = gates.find((x) => x.gate === g.value)
              const missing = gaps.filter((x) => x.blocks_gate === g.value && x.blocking)
                .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
              return (
                <details key={g.value} className={`gate${g.value === nextGate ? ' current' : ''}`} open={g.value === nextGate && missing.length > 0}>
                  <summary>
                    <span>{g.label}</span>
                    {st?.ready ? <span className="badge ok">Yes</span> : <span className="badge wait">{st?.unmet ? `${st.unmet} missing` : 'Not yet'}</span>}
                  </summary>
                  {missing.length > 0 && (
                    <ul>{missing.map((m, i) => <li key={i}>{m.label}{m.requested_from && m.requested_from !== 'internal' ? ` (${WHO[m.requested_from].toLowerCase()})` : ''}</li>)}</ul>
                  )}
                </details>
              )
            })}
          </section>

          {/* Deadlines */}
          <section className="card">
            <h2>Deadlines</h2>
            {(dlRes.data ?? []).length === 0 ? (
              <p className="hint">None running yet. They start from the contract, commissioning and completion dates.</p>
            ) : (
              <ul className="list">
                {dlRes.data!.map((d) => (
                  <li key={d.code} className={`item${d.status === 'done' ? ' done' : ''}`}>
                    <div>
                      <div className="strong" style={{ fontSize: 16 }}>{d.label}</div>
                      <div className="sub">{d.status === 'done' ? `Done ${formatDate(d.done_on)}` : `Due ${formatDate(d.due_on)}`} · {d.source}</div>
                    </div>
                    <span className={`badge ${d.status === 'overdue' ? 'bad' : d.status === 'done' ? 'ok' : 'wait'}`}>
                      {d.status === 'overdue' ? 'Overdue' : d.status === 'done' ? 'Done' : d.days_left === 0 ? 'Today' : `${d.days_left} days`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Details */}
          <section className="card">
            <h2>Details</h2>
            <dl className="facts">
              <div><dt>Homeowner</dt><dd>{job.homeowner_name || '—'}</dd></div>
              <div><dt>Phone</dt><dd>{job.homeowner_phone || '—'}</dd></div>
              <div><dt>Email</dt><dd>{job.homeowner_email || '—'}</dd></div>
              <div><dt>Installer</dt><dd>{job.installer?.name || '—'}</dd></div>
              <div><dt>Heat pump make</dt><dd>{job.manufacturer?.name || '—'}</dd></div>
              <div><dt>Heat loss by</dt><dd>{job.assignee?.name || 'Not assigned'}</dd></div>
              <div><dt>Estimated heat loss</dt><dd>{job.estimated_heat_loss_kw != null ? `${job.estimated_heat_loss_kw} kW` : '—'}</dd></div>
              <div><dt>CRM reference</dt><dd>{job.crm_ref || '—'}</dd></div>
              {job.job_type === 'new_build' && (
                <>
                  <div><dt>Owner’s current address</dt><dd>{formatAddress(job.owner_address) || '—'}</dd></div>
                  <div><dt>Main contractor</dt><dd>{job.main_contractor_name || '—'}</dd></div>
                </>
              )}
              <div><dt>Drive folder</dt><dd>{job.drive_folder_url ? <a href={job.drive_folder_url} target="_blank" rel="noreferrer">Open</a> : '—'}</dd></div>
              <div><dt>Stage</dt><dd>{stageLabel(job.stage as Stage)}</dd></div>
            </dl>
            {job.enquiry_notes && <p style={{ margin: 0 }}><strong>Notes:</strong> {job.enquiry_notes}</p>}
            {!job.on_hold_reason && (
              <details className="gate">
                <summary><span>Put on hold</span></summary>
                <form action={putOnHold.bind(null, job.id)} className="form" style={{ padding: 14, gap: 12 }}>
                  <label className="field"><span>Why</span><input className="input" name="reason" required /></label>
                  <label className="field"><span>Look at it again on</span><input className="input" type="date" name="review_on" min={today} required /></label>
                  <div className="actions"><button className="btn secondary" type="submit">Put on hold</button></div>
                </form>
              </details>
            )}
          </section>

          {/* Activity */}
          <section className="card">
            <h2>Activity</h2>
            <ul className="list log">
              {(logRes.data ?? []).map((e) => (
                <li key={e.id}>
                  <strong>{e.actor_label ?? (e.actor_kind === 'system' ? 'The app' : e.actor_kind)}</strong>{' '}
                  {describe(e.entity, e.action, e.changes)}
                  <div className="sub">{new Date(e.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/London' })}</div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  )
}

const THING: Record<string, string> = {
  jobs: 'the job', job_requirements: 'a requirement', job_milestones: 'a step', surveys: 'the survey',
  assessment_positions: 'a noise position', job_payments: 'a payment', hies_registrations: 'HIES',
  bus_applications: 'the BUS application', dno_applications: 'the DNO application', remedials: 'a remedial',
  spec_versions: 'the spec', job_operatives: 'the operatives', job_checkpoint_photos: 'a photo',
}

function describe(entity: string, action: string, changes: unknown) {
  const what = THING[entity] ?? entity.replace(/_/g, ' ')
  if (entity === 'job_milestones' && changes && typeof changes === 'object') {
    const code = (changes as Record<string, unknown>).milestone_code
    if (action === 'insert') return `ticked ${String(code).replace(/_/g, ' ')}`
    if (action === 'delete') return `unticked ${String(code).replace(/_/g, ' ')}`
  }
  if (action === 'insert') return entity === 'jobs' ? 'created the job' : `added ${what}`
  if (action === 'delete') return `removed ${what}`
  const fields = changes && typeof changes === 'object' ? Object.keys(changes as object) : []
  if (entity === 'jobs' && fields.includes('stage')) {
    const to = (changes as Record<string, { to: string }>).stage.to as Stage
    return `moved the job to ${stageLabel(to)}`
  }
  if (entity === 'job_requirements' && fields.includes('status')) {
    const to = (changes as Record<string, { to: string }>).status.to
    return to === 'received' ? 'marked a requirement as received' : to === 'waived' ? 'marked a requirement as not needed' : 'reopened a requirement'
  }
  return `updated ${what}${fields.length ? ` (${fields.map((f) => f.replace(/_/g, ' ')).join(', ')})` : ''}`
}
