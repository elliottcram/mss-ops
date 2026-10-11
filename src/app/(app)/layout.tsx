import Link from 'next/link'
import { Suspense } from 'react'
import { getCurrentStaff } from '@/lib/auth'
import { signOut } from '@/app/login/actions'

export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="logo">MSS</span>
          <span className="brand-name">Operations</span>
        </Link>
        <nav className="nav" aria-label="Main">
          <Link href="/">Jobs</Link>
          <Link href="/jobs/new" className="wide">New job</Link>
          <Link href="/installers">Installers</Link>
        </nav>
        <Suspense fallback={<div className="who" />}>
          <Who />
        </Suspense>
      </header>
      {children}
    </>
  )
}

async function Who() {
  const staff = await getCurrentStaff()
  return (
    <div className="who">
      <span className="name">{staff.name}</span>
      <span className="avatar" aria-hidden="true">{staff.name.charAt(0)}</span>
      <form action={signOut}>
        <button className="btn link small" type="submit">Sign out</button>
      </form>
    </div>
  )
}
