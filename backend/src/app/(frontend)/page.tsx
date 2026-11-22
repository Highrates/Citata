import Link from 'next/link'

export default function BackendHome() {
  return (
    <main style={{ fontFamily: 'system-ui', padding: 40 }}>
      <h1>Citata API</h1>
      <p>
        Payload admin: <Link href="/payload">/payload</Link>
      </p>
      <p>
        REST: <code>/api/cases</code>, <code>/api/articles</code>, …
      </p>
    </main>
  )
}
