import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Runs before every page: keeps the Supabase session fresh and sends anyone
// who isn't signed in to the sign-in page.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet, headers) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
          Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v))
        },
      },
    },
  )

  const { data } = await supabase.auth.getClaims()
  const signedIn = !!data?.claims
  const onLogin = request.nextUrl.pathname.startsWith('/login')

  if (!signedIn && !onLogin) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    return NextResponse.redirect(url)
  }
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
