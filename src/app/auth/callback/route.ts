import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Microsoft sends people back here after they sign in. Swap the one-time code
// for a session cookie, then go to the jobs list.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const home = request.nextUrl.clone()
  home.search = ''

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      home.pathname = '/'
      return NextResponse.redirect(home)
    }
  }
  home.pathname = '/login'
  home.searchParams.set('error', 'microsoft')
  return NextResponse.redirect(home)
}
