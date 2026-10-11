import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getManufacturers } from '@/lib/jobs'
import { addInstaller, addManufacturer } from './actions'

export default function InstallersPage({ searchParams }: PageProps<'/installers'>) {
  return (
    <main className="main">
      <h1 style={{ fontSize: 30 }}>Installers</h1>
      <Suspense fallback={<div className="card"><p className="hint">Loading…</p></div>}>
        <Installers searchParams={searchParams} />
      </Suspense>
    </main>
  )
}

async function Installers({ searchParams }: { searchParams: PageProps<'/installers'>['searchParams'] }) {
  const sp = await searchParams
  const supabase = await createClient()
  const [onboarding, installers, makes] = await Promise.all([
    supabase.from('installer_onboarding').select('installer_id, missing'),
    supabase.from('installers').select('id, name, contact_name, email, phone, manufacturer:manufacturers(name)').order('name'),
    getManufacturers(),
  ])
  const missing = new Map((onboarding.data ?? []).map((o) => [o.installer_id, o.missing ?? []]))
  const error = typeof sp.error === 'string' ? sp.error : null

  return (
    <>
      {error && <div className="banner error" role="alert">{error}</div>}
      <div className="cols">
        <section className="card">
          <h2>Onboarding</h2>
          <p className="hint">An installer must be fully onboarded before any of their jobs can be installed. It never holds up earlier stages.</p>
          {(installers.data ?? []).length === 0 ? (
            <div className="empty">No installers yet. Add one on the right.</div>
          ) : (
            <ul className="list">
              {installers.data!.map((i) => {
                const m = missing.get(i.id) ?? []
                return (
                  <li key={i.id}>
                    <details className="gate">
                      <summary>
                        <span>
                          {i.name}
                          <span className="sub" style={{ display: 'block', fontWeight: 400 }}>
                            {[i.contact_name, i.email, i.phone, i.manufacturer?.name].filter(Boolean).join(' · ') || 'No contact details yet'}
                          </span>
                        </span>
                        {m.length === 0 ? <span className="badge ok">Onboarded</span> : <span className="badge wait">{m.length} to do</span>}
                      </summary>
                      {m.length > 0 && <ul>{m.map((x) => <li key={x}>{x}</li>)}</ul>}
                    </details>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <div className="stack">
          <section className="card">
            <h2>Add an installer</h2>
            <form action={addInstaller} className="form" style={{ gap: 14 }}>
              <label className="field"><span>Company name</span><input className="input" name="name" required /></label>
              <label className="field"><span>Contact name</span><input className="input" name="contact_name" /></label>
              <label className="field"><span>Email</span><input className="input" name="email" type="email" /></label>
              <label className="field"><span>Phone</span><input className="input" name="phone" type="tel" /></label>
              <label className="field">
                <span>Usual heat pump make</span>
                <select className="select" name="default_manufacturer_id" defaultValue="">
                  <option value="">Not sure</option>
                  {makes.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </label>
              <div className="actions"><button className="btn" type="submit">Add installer</button></div>
            </form>
          </section>

          <section className="card">
            <h2>Heat pump makes</h2>
            <p className="hint">{makes.length ? makes.map((m) => m.name).join(', ') : 'None yet.'}</p>
            <form action={addManufacturer} className="filters">
              <label className="sr-only" htmlFor="make">Make</label>
              <input id="make" className="input" name="name" placeholder="e.g. Vaillant" style={{ width: 220 }} required />
              <button className="btn secondary" type="submit">Add make</button>
            </form>
          </section>
        </div>
      </div>
    </>
  )
}
