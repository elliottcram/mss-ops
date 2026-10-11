'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { createJob, type NewJobState } from './actions'

type Props = {
  installers: { id: string; name: string; manufacturerId: string | null }[]
  manufacturers: { id: string; name: string }[]
  staff: { id: string; name: string }[]
}

export function NewJobForm({ installers, manufacturers, staff }: Props) {
  const [state, action, pending] = useActionState<NewJobState, FormData>(createJob, {})
  const v = state.values ?? {}
  const [jobType, setJobType] = useState(v.job_type ?? '')
  const [installer, setInstaller] = useState(v.installer_id ?? '')
  const [make, setMake] = useState(v.manufacturer_id ?? '')

  // Prefill the make from the installer's usual brand; still editable.
  function pickInstaller(id: string) {
    setInstaller(id)
    const m = installers.find((i) => i.id === id)?.manufacturerId
    if (m) setMake(m)
  }
  const newBuild = jobType === 'new_build'

  return (
    <form action={action} className="card form">
      {state.error && <div className="banner error" role="alert">{state.error}</div>}

      <section className="section">
        <h2>The job</h2>
        <div className="grid2">
          <label className="field">
            <span>Job reference</span>
            <input className="input" name="job_ref" required defaultValue={v.job_ref} placeholder="e.g. MSS-1043" />
          </label>
          <label className="field">
            <span>CRM reference <small>(optional)</small></span>
            <input className="input" name="crm_ref" defaultValue={v.crm_ref} />
          </label>
        </div>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="field" style={{ fontWeight: 600, marginBottom: 8 }}>Existing home or new build?</legend>
          <div className="choice">
            <label><input type="radio" name="job_type" value="retrofit" checked={jobType === 'retrofit'} onChange={() => setJobType('retrofit')} />Existing home (retrofit)</label>
            <label><input type="radio" name="job_type" value="new_build" checked={newBuild} onChange={() => setJobType('new_build')} />New build</label>
          </div>
        </fieldset>
        <div className="grid2">
          <label className="field">
            <span>Heat loss done by</span>
            <select className="select" name="assignee_id" defaultValue={v.assignee_id ?? ''}>
              <option value="">Not assigned yet</option>
              {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <small>Chases escalate to this person.</small>
          </label>
          <label className="field">
            <span>Estimated heat loss from the quote <small>(kW, optional)</small></span>
            <input className="input" name="estimated_heat_loss_kw" type="number" step="0.1" min="0" defaultValue={v.estimated_heat_loss_kw} />
          </label>
        </div>
      </section>

      <section className="section">
        <h2>Homeowner</h2>
        <div className="grid3">
          <label className="field"><span>Name</span><input className="input" name="homeowner_name" defaultValue={v.homeowner_name} autoComplete="off" /></label>
          <label className="field"><span>Phone</span><input className="input" name="homeowner_phone" type="tel" defaultValue={v.homeowner_phone} autoComplete="off" /></label>
          <label className="field"><span>Email</span><input className="input" name="homeowner_email" type="email" defaultValue={v.homeowner_email} autoComplete="off" /></label>
        </div>
      </section>

      <section className="section">
        <h2>Where the heat pump is going</h2>
        <div className="grid2">
          {newBuild && (
            <label className="field span2"><span>Plot or site name</span><input className="input" name="plot_or_site_name" defaultValue={v.plot_or_site_name} placeholder="e.g. Plot 4, Meadow Rise" /></label>
          )}
          <label className="field"><span>Address line 1</span><input className="input" name="line1" defaultValue={v.line1} /></label>
          <label className="field"><span>Address line 2</span><input className="input" name="line2" defaultValue={v.line2} /></label>
          <label className="field"><span>Town</span><input className="input" name="town" defaultValue={v.town} /></label>
          <label className="field"><span>Postcode</span><input className="input" name="postcode" defaultValue={v.postcode} style={{ textTransform: 'uppercase' }} />
            {newBuild && <small>Leave blank if the plot doesn’t have one yet.</small>}
          </label>
        </div>
      </section>

      {newBuild && (
        <section className="section">
          <h2>Homeowner’s current address</h2>
          <p className="hint">Where they live now. Ofgem checks their ID against this for the BUS grant.</p>
          <div className="grid2">
            <label className="field"><span>Address line 1</span><input className="input" name="owner_line1" defaultValue={v.owner_line1} /></label>
            <label className="field"><span>Address line 2</span><input className="input" name="owner_line2" defaultValue={v.owner_line2} /></label>
            <label className="field"><span>Town</span><input className="input" name="owner_town" defaultValue={v.owner_town} /></label>
            <label className="field"><span>Postcode</span><input className="input" name="owner_postcode" defaultValue={v.owner_postcode} style={{ textTransform: 'uppercase' }} /></label>
          </div>
        </section>
      )}

      <section className="section">
        <h2>Installer and equipment</h2>
        <div className="grid2">
          <label className="field">
            <span>Installer</span>
            <select className="select" name="installer_id" value={installer} onChange={(e) => pickInstaller(e.target.value)}>
              <option value="">Not chosen yet</option>
              {installers.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
              <option value="new">Someone new…</option>
            </select>
          </label>
          {installer === 'new' ? (
            <label className="field"><span>New installer’s company name</span><input className="input" name="new_installer" defaultValue={v.new_installer} required /></label>
          ) : <div />}
          <label className="field">
            <span>Heat pump make</span>
            <select className="select" name="manufacturer_id" value={make} onChange={(e) => setMake(e.target.value)}>
              <option value="">Not sure yet</option>
              {manufacturers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            {manufacturers.length === 0 && <small>No makes added yet.</small>}
          </label>
          <label className="field">
            <span>Google Drive folder <small>(optional link)</small></span>
            <input className="input" name="drive_folder_url" type="url" defaultValue={v.drive_folder_url} />
          </label>
          {newBuild && (
            <>
              <label className="field"><span>Main contractor <small>(if any)</small></span><input className="input" name="main_contractor_name" defaultValue={v.main_contractor_name} /></label>
              <label className="field"><span>Main contractor email</span><input className="input" name="main_contractor_email" type="email" defaultValue={v.main_contractor_email} /></label>
            </>
          )}
        </div>
      </section>

      <section className="section">
        <label className="field">
          <span>Anything else we should know <small>(optional)</small></span>
          <textarea className="textarea" name="notes" defaultValue={v.notes} />
        </label>
      </section>

      <div className="actions">
        <Link className="btn secondary" href="/">Cancel</Link>
        <button className="btn" type="submit" disabled={pending}>{pending ? 'Saving…' : 'Create job'}</button>
      </div>
    </form>
  )
}
