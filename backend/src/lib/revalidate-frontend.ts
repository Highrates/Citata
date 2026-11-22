/**
 * On-demand revalidate публичного Next (frontend).
 * Backend больше не шарит next/cache с сайтом.
 */
export async function revalidateFrontend(options: {
  path?: string
  tag?: string
  paths?: string[]
  tags?: string[]
}) {
  const base = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '')
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) {
    console.warn('[revalidateFrontend] REVALIDATE_SECRET not set — skip')
    return
  }

  const paths = [...(options.paths ?? []), ...(options.path ? [options.path] : [])]
  const tags = [...(options.tags ?? []), ...(options.tag ? [options.tag] : [])]

  const jobs: Promise<Response>[] = []

  if (paths.length === 0 && tags.length === 0) {
    jobs.push(
      fetch(`${base}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidate-secret': secret,
        },
        body: JSON.stringify({ tag: 'sitemap' }),
      }),
    )
  }

  for (const path of paths) {
    jobs.push(
      fetch(`${base}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidate-secret': secret,
        },
        body: JSON.stringify({ path }),
      }),
    )
  }

  for (const tag of tags) {
    jobs.push(
      fetch(`${base}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidate-secret': secret,
        },
        body: JSON.stringify({ tag }),
      }),
    )
  }

  await Promise.allSettled(jobs)
}
