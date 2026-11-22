import 'server-only'

import { cookies } from 'next/headers'

import { hasPayloadApiKey, payloadGet, payloadMutate, type PayloadListResponse } from '@/lib/api/payload-client'
import { ADMIN_SESSION_COOKIE } from '@/lib/admin/session'
import type {
  Article as PayloadArticle,
  Author,
  Case as PayloadCase,
  Media,
  Service as PayloadService,
} from '@/payload-types'
import type { PressMention as PayloadPressMention, SiteSetting } from '@/payload-types'

export async function requireAdminSession() {
  const cookieStore = await cookies()
  if (!cookieStore.get(ADMIN_SESSION_COOKIE)?.value) {
    throw new Error('Unauthorized')
  }
}

/** Запись доступна, если есть API-ключ Payload на backend */
export function hasPayloadDatabase() {
  return hasPayloadApiKey()
}

export async function getAdminPayload() {
  if (!hasPayloadDatabase()) {
    throw new Error('PAYLOAD_API_KEY не настроен — подключите backend')
  }
  await requireAdminSession()
  return {
    find: async <T>(args: {
      collection: string
      where?: Record<string, unknown>
      depth?: number
      limit?: number
      page?: number
      sort?: string
    }) => {
      const params: Record<string, string | number | boolean> = {
        depth: args.depth ?? 0,
        limit: args.limit ?? 100,
      }
      if (args.page) params.page = args.page
      if (args.sort) params.sort = args.sort
      if (args.where) {
        // slug equals helper — самый частый кейс
        const slugEq = (args.where as { slug?: { equals?: string } }).slug?.equals
        const statusEq = (args.where as { status?: { equals?: string } }).status?.equals
        const nameEq = (args.where as { name?: { equals?: string } }).name?.equals
        const filenameEq = (args.where as { filename?: { equals?: string } }).filename?.equals
        const urlEq = (args.where as { url?: { equals?: string } }).url?.equals
        if (slugEq) params['where[slug][equals]'] = slugEq
        if (statusEq) params['where[status][equals]'] = statusEq
        if (nameEq) params['where[name][equals]'] = nameEq
        if (filenameEq) params['where[filename][equals]'] = filenameEq
        if (urlEq) params['where[url][equals]'] = urlEq
      }
      return payloadGet<PayloadListResponse<T>>(`/api/${args.collection}`, params)
    },
    findByID: async <T>(args: { collection: string; id: number | string; depth?: number }) => {
      return payloadGet<T>(`/api/${args.collection}/${args.id}`, { depth: args.depth ?? 0 })
    },
    findGlobal: async <T>(args: { slug: string; depth?: number }) => {
      return payloadGet<T>(`/api/globals/${args.slug}`, { depth: args.depth ?? 0 })
    },
    create: async <T>(args: { collection: string; data: unknown; draft?: boolean }) => {
      return payloadMutate<T>('POST', `/api/${args.collection}`, args.data)
    },
    update: async <T>(args: {
      collection: string
      id: number | string
      data: unknown
    }) => {
      return payloadMutate<T>('PATCH', `/api/${args.collection}/${args.id}`, args.data)
    },
    updateGlobal: async <T>(args: { slug: string; data: unknown }) => {
      return payloadMutate<T>('POST', `/api/globals/${args.slug}`, args.data)
    },
    delete: async <T>(args: { collection: string; id: number | string }) => {
      return payloadMutate<T>('DELETE', `/api/${args.collection}/${args.id}`)
    },
  }
}

export type AdminPayloadClient = Awaited<ReturnType<typeof getAdminPayload>>

export async function ensureMediaByUrl(
  payload: AdminPayloadClient,
  url: string,
  alt: string,
): Promise<number> {
  const trimmed = url.trim()
  if (!trimmed) throw new Error('URL обложки обязателен')

  const byUrl = await payload.find<Media>({
    collection: 'media',
    where: { url: { equals: trimmed } },
    limit: 1,
  })
  if (byUrl.docs[0]) return byUrl.docs[0].id

  const byFilename = await payload.find<Media>({
    collection: 'media',
    where: { filename: { equals: trimmed } },
    limit: 1,
  })
  if (byFilename.docs[0]) return byFilename.docs[0].id

  const filenameFromPath = trimmed.split('/').pop()?.split('?')[0]
  if (filenameFromPath && filenameFromPath !== trimmed) {
    const byPathName = await payload.find<Media>({
      collection: 'media',
      where: { filename: { equals: filenameFromPath } },
      limit: 1,
    })
    if (byPathName.docs[0]) return byPathName.docs[0].id
  }

  const created = await payload.create<Media>({
    collection: 'media',
    data: {
      alt: alt || 'Медиа',
      filename: trimmed,
      url: trimmed,
    },
  })

  return created.id
}

export async function ensureAuthor(
  payload: AdminPayloadClient,
  name: string,
  role: string,
): Promise<number> {
  const trimmedName = name.trim()
  if (!trimmedName) throw new Error('Автор обязателен')

  const existing = await payload.find<Author>({
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

  const created = await payload.create<Author>({
    collection: 'authors',
    data: { name: trimmedName, role: role || undefined },
  })

  return created.id
}

export async function findCaseIdBySlug(payload: AdminPayloadClient, slug: string) {
  const result = await payload.find<PayloadCase>({
    collection: 'cases',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return result.docs[0]?.id
}

export async function findArticleIdBySlug(payload: AdminPayloadClient, slug: string) {
  const result = await payload.find<PayloadArticle>({
    collection: 'articles',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return result.docs[0]?.id
}

export async function findServiceIdBySlug(payload: AdminPayloadClient, slug: string) {
  const result = await payload.find<PayloadService>({
    collection: 'services',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return result.docs[0]?.id
}

// re-export types used by content-actions
export type { PayloadCase, PayloadPressMention, PayloadService, SiteSetting }
