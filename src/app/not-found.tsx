import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="signin">
      <div className="card">
        <h1 style={{ fontSize: 26 }}>Not found</h1>
        <p className="hint">That page or job doesn’t exist, or you don’t have access to it.</p>
        <Link className="btn" href="/">Back to jobs</Link>
      </div>
    </main>
  )
}
