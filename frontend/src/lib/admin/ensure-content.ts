import type { PayloadListResponse } from '@/lib/api/payload-client-types'

type EnsureClient = {
  find: <T>(args: {
    collection: string
    where?: Record<string, unknown>
    limit?: number
  }) => Promise<PayloadListResponse<T>>
  create: <T>(args: { collection: string; data: unknown; draft?: boolean }) => Promise<T>
  update: <T>(args: {
    collection: string
    id: number | string
    data: unknown
  }) => Promise<T>
}

type MediaDoc = { id: number; url?: string | null; filename?: string | null }
type AuthorDoc = { id: number; name: string; role?: string | null }

function mediaLookupCandidates(url: string): string[] {
  const trimmed = url.trim()
  const out = new Set<string>()
  if (trimmed) out.add(trimmed)

  try {
    const parsed = new URL(trimmed)
    out.add(parsed.pathname)
    const base = parsed.pathname.split('/').pop()
    if (base) out.add(base)
  } catch {
    // relative path
    const base = trimmed.split('/').pop()?.split('?')[0]
    if (base) out.add(base)
  }

  const filename = trimmed.split('/').pop()?.split('?')[0]
  if (filename) out.add(filename)

  return [...out]
}

/**
 * Resolve an existing media id by URL / filename.
 * Does NOT create stub JSON media — that diverges from real multipart uploads
 * and risks orphans / unique collisions. Callers must upload via /admin/api/media/upload.
 */
export async function ensureMediaByUrl(
  payload: EnsureClient,
  url: string,
  _alt: string,
): Promise<number> {
  const trimmed = url.trim()
  if (!trimmed) throw new Error('URL обложки обязателен')

  for (const candidate of mediaLookupCandidates(trimmed)) {
    const byUrl = await payload.find<MediaDoc>({
      collection: 'media',
      where: { url: { equals: candidate } },
      limit: 1,
    })
    if (byUrl.docs[0]) return byUrl.docs[0].id

    const byFilename = await payload.find<MediaDoc>({
      collection: 'media',
      where: { filename: { equals: candidate } },
      limit: 1,
    })
    if (byFilename.docs[0]) return byFilename.docs[0].id
  }

  throw new Error(
    `Медиа не найдено для «${trimmed}». Загрузите файл через админку (не вставляйте внешний URL).`,
  )
}

export async function ensureAuthor(
  payload: EnsureClient,
  name: string,
  role: string,
): Promise<number> {
  const trimmedName = name.trim()
  if (!trimmedName) throw new Error('Автор обязателен')

  const existing = await payload.find<AuthorDoc>({
    collection: 'authors',
    where: { name: { equals: trimmedName } },
    limit: 1,
  })

  if (existing.docs[0]) {
    if (role && existing.docs[0].role !== role) {
      await payload.update({
        collection: 'authors',
        id: existing.docs[0].id,
        data: { role },
      })
    }
    return existing.docs[0].id
  }

  const created = await payload.create<AuthorDoc>({
    collection: 'authors',
    data: { name: trimmedName, role: role || undefined },
  })

  return created.id
}
