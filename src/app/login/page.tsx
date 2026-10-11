import { Suspense } from 'react'
import { SignInForm } from './sign-in-form'
import { signInWithMicrosoft, signOut } from './actions'

export default function LoginPage({ searchParams }: PageProps<'/login'>) {
  return (
    <main className="signin">
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="logo">MSS</span>
          <h1 style={{ fontSize: 26 }}>Sign in</h1>
        </div>
        <Suspense fallback={null}>
          <Problem searchParams={searchParams} />
        </Suspense>
        <form action={signInWithMicrosoft}>
          <button className="btn" type="submit" style={{ width: '100%', height: 56, fontSize: 18 }}>
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill="#F25022" /><rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF" /><rect x="11" y="11" width="9" height="9" fill="#FFB900" />
            </svg>
            Sign in with your work account
          </button>
        </form>
        <p className="hint">Use your MSS Microsoft 365 email. You’ll confirm it’s you the same way you do for Outlook.</p>
        <details className="gate">
          <summary><span style={{ fontWeight: 400 }}>Sign in with an email and password instead</span></summary>
          <div style={{ padding: 14 }}><SignInForm /></div>
        </details>
      </div>
    </main>
  )
}

async function Problem({ searchParams }: { searchParams: PageProps<'/login'>['searchParams'] }) {
  const { error } = await searchParams
  if (error === 'microsoft') {
    return <div className="banner error" role="alert">Microsoft sign-in didn’t go through. Try again, or ask Elliott if it keeps happening.</div>
  }
  if (error !== 'not_staff') return null
  return (
    <div className="banner error">
      You’re signed in, but your account isn’t set up as MSS staff yet. Ask Elliott to add you.
      <form action={signOut} style={{ marginTop: 8 }}>
        <button className="btn link small" type="submit">Sign out</button>
      </form>
    </div>
  )
}
