import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getInstallers, getManufacturers } from '@/lib/jobs'
import { NewJobForm } from './new-job-form'

export default function NewJobPage() {
  return (
    <main className="main" style={{ maxWidth: 980 }}>
      <div>
        <div className="crumbs">Jobs</div>
        <h1 style={{ fontSize: 30 }}>New job</h1>
        <p className="hint" style={{ marginTop: 6 }}>
          Only the reference is needed now. Fill in what you know; the job page lists what’s still missing and who to ask.
        </p>
      </div>
      <Suspense fallback={<div className="card"><p className="hint">Loading…</p></div>}>
        <Form />
      </Suspense>
    </main>
  )
}

async function Form() {
  const supabase = await createClient()
  const [installers, manufacturers, staff] = await Promise.all([
    getInstallers(),
    getManufacturers(),
    supabase.from('staff').select('id, name').eq('active', true).order('name'),
  ])
  return (
    <NewJobForm
      installers={installers.filter((i) => i.active).map((i) => ({ id: i.id, name: i.name, manufacturerId: i.default_manufacturer_id }))}
      manufacturers={manufacturers}
      staff={staff.data ?? []}
    />
  )
}
