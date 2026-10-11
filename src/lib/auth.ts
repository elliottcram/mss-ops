import 'server-only'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type Staff = { id: string; name: string; role: string; email: string | null }

// The signed-in person's staff record. Anyone signed in without one can't see
// any data (row-level security), so they get a clear message instead.
export async function getCurrentStaff(): Promise<Staff> {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims) redirect('/login')

  const { data: staff } = await supabase
    .from('staff')
    .select('id, name, role, email')
    .eq('auth_user_id', claims.claims.sub)
    .eq('active', true)
    .maybeSingle()

  if (!staff) redirect('/login?error=not_staff')
  return staff
}
