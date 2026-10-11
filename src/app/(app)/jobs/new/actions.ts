'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/database.types'

export type NewJobState = { error?: string; values?: Record<string, string> }

const text = (f: FormData, k: string) => {
  const v = String(f.get(k) ?? '').trim()
  return v === '' ? null : v
}

export async function createJob(_prev: NewJobState, f: FormData): Promise<NewJobState> {
  const values = Object.fromEntries([...f.entries()].map(([k, v]) => [k, String(v)]))
  const jobRef = text(f, 'job_ref')
  if (!jobRef) return { error: 'Give the job a reference.', values }

  const jobType = text(f, 'job_type') as Database['public']['Enums']['job_type'] | null
  const supabase = await createClient()

  // Install address
  let installAddressId: string | null = null
  const addr = {
    plot_or_site_name: text(f, 'plot_or_site_name'),
    line1: text(f, 'line1'), line2: text(f, 'line2'), town: text(f, 'town'),
    postcode: text(f, 'postcode')?.toUpperCase() ?? null,
  }
  if (Object.values(addr).some(Boolean)) {
    const { data, error } = await supabase.from('addresses').insert(addr).select('id').single()
    if (error) return { error: 'Couldn’t save the address: ' + error.message, values }
    installAddressId = data.id
  }

  // Owner's current address: new build only (for the Ofgem ID check)
  let ownerAddressId: string | null = null
  if (jobType === 'new_build') {
    const owner = {
      line1: text(f, 'owner_line1'), line2: text(f, 'owner_line2'), town: text(f, 'owner_town'),
      postcode: text(f, 'owner_postcode')?.toUpperCase() ?? null,
    }
    if (Object.values(owner).some(Boolean)) {
      const { data, error } = await supabase.from('addresses').insert(owner).select('id').single()
      if (error) return { error: 'Couldn’t save the owner’s address: ' + error.message, values }
      ownerAddressId = data.id
    }
  }

  // Installer: pick one, or type a new name to add them
  let installerId = text(f, 'installer_id')
  const newInstaller = text(f, 'new_installer')
  if (installerId === 'new' && newInstaller) {
    const { data, error } = await supabase.from('installers').insert({ name: newInstaller }).select('id').single()
    if (error) return { error: 'Couldn’t add the installer: ' + error.message, values }
    installerId = data.id
  } else if (installerId === 'new') installerId = null

  const hl = text(f, 'estimated_heat_loss_kw')
  const { data: job, error } = await supabase
    .from('jobs')
    .insert({
      job_ref: jobRef,
      crm_ref: text(f, 'crm_ref'),
      job_type: jobType,
      stage: 'job_setup',
      assignee_id: text(f, 'assignee_id'),
      homeowner_name: text(f, 'homeowner_name'),
      homeowner_phone: text(f, 'homeowner_phone'),
      homeowner_email: text(f, 'homeowner_email'),
      install_address_id: installAddressId,
      owner_residential_address_id: ownerAddressId,
      installer_id: installerId,
      manufacturer_id: text(f, 'manufacturer_id'),
      main_contractor_name: jobType === 'new_build' ? text(f, 'main_contractor_name') : null,
      main_contractor_email: jobType === 'new_build' ? text(f, 'main_contractor_email') : null,
      estimated_heat_loss_kw: hl ? Number(hl) : null,
      drive_folder_url: text(f, 'drive_folder_url'),
      enquiry_notes: text(f, 'notes'),
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') return { error: `There is already a job called ${jobRef}. Use a different reference.`, values }
    return { error: 'Couldn’t save the job: ' + error.message, values }
  }
  redirect(`/jobs/${job.id}?created=1`)
}
