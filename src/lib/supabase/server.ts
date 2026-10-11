import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { connection } from 'next/server'
import type { Database } from '@/lib/database.types'

// A new client per request: it reads and writes the signed-in user's cookies,
// so every query runs as that person and row-level security applies.
export async function createClient() {
  // Always request-time: the Supabase client reads the clock (token expiry).
  await connection()
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Called from a Server Component, where cookies are read-only.
            // proxy.ts refreshes the session, so this is safe to ignore.
          }
        },
      },
    },
  )
}
