import { Suspense } from 'react'
import { SignInForm } from './sign-in-form'
import { signOut } from './actions'

export default function LoginPage({ searchParams }: PageProps<'/login'>) {
  return (
    <main className="signin">
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="logo">MSS</span>
          <h1 style={{ fontSize: 26 }}>Sign in</h1>
        </div>
        <Suspense fallback={null}>
          <NotStaff searchParams={searchParams} />
        </Suspense>
        <SignInForm />
      </div>
    </main>
  )
}

async function NotStaff({ searchParams }: { searchParams: PageProps<'/login'>['searchParams'] }) {
  const { error } = await searchParams
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
