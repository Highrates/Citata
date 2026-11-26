import type { Payload } from 'payload'

/** Collect `/works/:slug` paths from event.cases (populated docs or ids). */
export async function resolveEventCasePaths(
  payload: Payload,
  raw: unknown,
): Promise<string[]> {
  if (!Array.isArray(raw) || raw.length === 0) return []

  const paths: string[] = []
  const pendingIds: number[] = []

  for (const row of raw) {
    if (typeof row === 'object' && row && 'slug' in row && typeof row.slug === 'string') {
      paths.push(`/works/${row.slug}`)
      continue
    }
    if (typeof row === 'number') pendingIds.push(row)
    else if (typeof row === 'string' && /^\d+$/.test(row)) pendingIds.push(Number(row))
  }

  for (const id of pendingIds) {
    try {
      const doc = await payload.findByID({
        collection: 'cases',
        id,
        depth: 0,
        overrideAccess: true,
      })
      if (doc?.slug) paths.push(`/works/${doc.slug}`)
    } catch {
      // case may already be gone
    }
  }

  return [...new Set(paths)]
}
