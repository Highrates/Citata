export default function BackendHome() {
  return (
    <main style={{ fontFamily: 'system-ui', padding: 40 }}>
      <h1>Citata API</h1>
      <p>
        Payload admin: <a href="/payload">/payload</a>
      </p>
      <p>
        REST: <code>/api/cases</code>, <code>/api/articles</code>, …
      </p>
    </main>
  )
}
