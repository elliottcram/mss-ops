'use server'

import { refresh } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const text = (f: FormData, k: string) => String(f.get(k) ?? '').trim() || null

export async function addInstaller(f: FormData) {
  const name = text(f, 'name')
  if (!name) redirect('/installers?error=' + encodeURIComponent('Give the installer a company name.'))
  const supabase = await createClient()
  const { error } = await supabase.from('installers').insert({
    name,
    contact_name: text(f, 'contact_name'),
    email: text(f, 'email'),
    phone: text(f, 'phone'),
    default_manufacturer_id: text(f, 'default_manufacturer_id'),
    onboarding_started_on: new Date().toISOString().slice(0, 10),
  })
  if (error) redirect('/installers?error=' + encodeURIComponent(error.message))
  refresh()
}

export async function addManufacturer(f: FormData) {
  const name = text(f, 'name')
  if (!name) return
  const supabase = await createClient()
  const { error } = await supabase.from('manufacturers').insert({ name })
  if (error) {
    const msg = error.code === '23505' ? `${name} is already on the list.` : error.message
    redirect('/installers?error=' + encodeURIComponent(msg))
  }
  refresh()
}
