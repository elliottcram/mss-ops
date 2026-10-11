import Link from 'next/link'
import { Suspense } from 'react'
import { getCurrentStaff } from '@/lib/auth'
import { getJobRows, type JobRow, type Look } from '@/lib/jobs'
import { JOB_TYPE, STAGES, WHO, formatDate, gateLabel, stageShort } from '@/lib/labels'

const LOOK: Record<Look, { label: string; ink: string; dot: string; bar: string }> = {
  overdue: { label: 'Deadline missed', ink: 'var(--red-ink)', dot: 'var(--red)', bar: 'var(--red)' },
  needed: { label: 'Still needed', ink: 'var(--amber-ink)', dot: '#D99100', bar: 'var(--amber)' },
  ready: { label: 'Ready to move on', ink: 'var(--green-ink)', dot: '#1E7A4A', bar: 'var(--green)' },
  hold: { label: 'On hold', ink: 'var(--ink-2)', dot: 'var(--grey)', bar: 'var(--grey)' },
}
const RANK: Record<Look, number> = { overdue: 0, needed: 1, ready: 2, hold: 3 }

export default function HomePage({ searchParams }: PageProps<'/'>) {
  return (
    <main className="main">
      <Suspense fallback={<div className="card"><p className="hint">Loading jobs…</p></div>}>
        <Home searchParams={searchParams} />
      </Suspense>
    </main>
  )
}

async function Home({ searchParams }: { searchParams: PageProps<'/'>['searchParams'] }) {
  const sp = await searchParams
  const show = typeof sp.show === 'string' ? sp.show : ''
  const stage = typeof sp.stage === 'string' ? sp.stage : ''
  const type = typeof sp.type === 'string' ? sp.type : ''
  const q = typeof sp.q === 'string' ? sp.q.trim().toLowerCase() : ''

  const [staff, all] = await Promise.all([getCurrentStaff(), getJobRows()])
  const live = all.filter((j) => j.stage !== 'closed')
  const count = (l: Look) => live.filter((j) => j.look === l).length
  const dueSoon = live.filter((j) => j.dueSoon.length > 0).length

  let rows = show === 'closed' ? all.filter((j) => j.stage === 'closed') : live
  if (show === 'due_soon') rows = rows.filter((j) => j.dueSoon.length > 0)
  else if (show && show !== 'closed') rows = rows.filter((j) => j.look === show)
  if (stage) rows = rows.filter((j) => j.stage === stage)
  if (type) rows = rows.filter((j) => j.type === type)
  if (q) rows = rows.filter((j) => [j.ref, j.homeowner, j.address, j.installer].join(' ').toLowerCase().includes(q))
  rows.sort((a, b) => RANK[a.look] - RANK[b.look] || a.updatedAt.localeCompare(b.updatedAt))

  const stats = [
    { key: 'overdue', label: 'Deadline missed', sub: 'A legal or scheme deadline has passed', n: count('overdue'), red: true },
    { key: 'needed', label: 'Still needed', sub: 'Something blocks the next step', n: count('needed'), bar: LOOK.needed.bar },
    { key: 'due_soon', label: 'Due this week', sub: 'Deadlines coming up', n: dueSoon, bar: 'var(--blue)' },
    { key: 'ready', label: 'Ready to move on', sub: 'Nothing missing for the next step', n: count('ready'), bar: LOOK.ready.bar },
  ]
  const filtersOn = !!(show || stage || type || q)
  const hour = Number(new Date().toLocaleString('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Europe/London' }))
  const hello = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <>
      <section className="hero" aria-label="Today at a glance">
        <div className="hero-left">
          <div>
            <h1>{hello}, {staff.name.split(' ')[0]}</h1>
            <p>{live.length === 0 ? 'No jobs yet. Add the first one.' : 'Here is what needs doing.'}</p>
          </div>
          <Link className="btn-hero" href="/jobs/new">
            New job
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          </Link>
        </div>
        <div className="stats">
          {stats.map((s) => (
            <Link
              key={s.key}
              href={show === s.key ? '/' : `/?show=${s.key}`}
              className={`stat${s.red ? ' red' : ''}`}
              aria-current={show === s.key}
            >
              {!s.red && <span className="bar" style={{ background: s.bar }} aria-hidden="true" />}
              <span className="body">
                <span className="count">{s.n}</span>
                <span className="label">{s.label}</span>
                <span className="sub">{s.sub}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="card" aria-label="Jobs">
        <form className="filters" method="get">
          {show && <input type="hidden" name="show" value={show} />}
          <label className="sr-only" htmlFor="f-stage">Stage</label>
          <select id="f-stage" name="stage" defaultValue={stage} className="select" style={{ width: 230 }}>
            <option value="">All stages</option>
            {STAGES.filter((s) => s.value !== 'closed').map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <label className="sr-only" htmlFor="f-type">Job type</label>
          <select id="f-type" name="type" defaultValue={type} className="select" style={{ width: 170 }}>
            <option value="">All job types</option>
            <option value="new_build">New build</option>
            <option value="retrofit">Retrofit</option>
          </select>
          <label className="sr-only" htmlFor="f-q">Find a job</label>
          <input id="f-q" name="q" defaultValue={q} className="input search" style={{ width: 300 }} placeholder="Name, address, reference or installer" />
          <button className="btn secondary" type="submit">Show</button>
          {filtersOn && <Link className="btn link" href="/">Clear filters</Link>}
          <div className="grow" />
          <Link className="btn link" href={show === 'closed' ? '/' : '/?show=closed'}>
            {show === 'closed' ? 'Back to live jobs' : 'Closed jobs'}
          </Link>
        </form>

        {rows.length === 0 ? (
          <div className="empty">
            {all.length === 0 ? <>No jobs yet. <Link href="/jobs/new">Add the first job</Link>.</> : 'No jobs match. Try clearing the filters.'}
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th scope="col" style={{ width: 130 }}>Job</th>
                <th scope="col">Homeowner and address</th>
                <th scope="col" style={{ width: 130 }}>Stage</th>
                <th scope="col">What is needed next</th>
                <th scope="col" style={{ width: 190 }}>Status</th>
                <th scope="col" style={{ width: 120 }}><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody>{rows.map((j) => <Row key={j.id} j={j} />)}</tbody>
          </table>
        )}
      </section>
    </>
  )
}

function Row({ j }: { j: JobRow }) {
  const L = LOOK[j.look]
  const first = j.nextMissing[0]
  let headline: string
  let who: string
  if (j.look === 'hold') { headline = j.holdReason ?? 'On hold'; who = '' }
  else if (j.look === 'overdue') { headline = j.overdue[0].label; who = `Was due ${formatDate(j.overdue[0].due_on)}` }
  else if (first) {
    headline = first.label + (j.nextMissing.length > 1 ? `, and ${j.nextMissing.length - 1} more` : '')
    who = first.from ? WHO[first.from] : ''
  } else { headline = j.nextGate ? `Nothing. ${gateLabel(j.nextGate)}` : 'Nothing'; who = '' }

  return (
    <tr className={j.look === 'overdue' ? 'alert' : undefined}>
      <td>
        <div className="ref"><span className="bar" style={{ background: L.bar }} aria-hidden="true" />{j.ref}</div>
      </td>
      <td>
        <div className="strong">{j.homeowner || 'No homeowner yet'}</div>
        <div className="sub">{j.address || 'No address yet'}</div>
      </td>
      <td>
        <div style={{ fontWeight: 600 }}>{stageShort(j.stage)}</div>
        <div className="sub">{j.type ? JOB_TYPE[j.type] : 'Type not set'}</div>
      </td>
      <td>
        <div style={{ fontWeight: 600 }}>{headline}</div>
        {who && <div className="sub">{who}</div>}
      </td>
      <td>
        <span className="status" style={{ color: L.ink }}><span className="dot" style={{ background: L.dot }} aria-hidden="true" />{L.label}</span>
      </td>
      <td>
        <Link className="btn secondary small" href={`/jobs/${j.id}`}>Open job</Link>
      </td>
    </tr>
  )
}
