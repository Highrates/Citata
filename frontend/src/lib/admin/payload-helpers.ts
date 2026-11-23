import 'server-only'

import { hasPayloadApiKey, payloadGet, payloadMutate, type PayloadListResponse } from '@/lib/api/payload-client'
import { hasValidAdminSessionCookie } from '@/lib/admin/session'
import { ensureAuthor, ensureMediaByUrl, resolveMediaId } from '@/lib/admin/ensure-content'
import { buildPayloadWhereParams } from '@/lib/admin/payload-where'
import type {
  Article as PayloadArticle,
  Case as PayloadCase,
  Service as PayloadService,
} from '@/payload-types'
import type { PressMention as PayloadPressMention, SiteSetting } from '@/payload-types'

export { ensureAuthor, ensureMediaByUrl, resolveMediaId }

export async function requireAdminSession() {
  if (!(await hasValidAdminSessionCookie())) {
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
        Object.assign(params, buildPayloadWhereParams(args.where))
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
      // Always unwrap `{ doc }` so callers can use `.id` safely.
      return payloadMutate<T>('POST', `/api/${args.collection}`, args.data, { unwrapDoc: true })
    },
    update: async <T>(args: {
      collection: string
      id: number | string
      data: unknown
    }) => {
      return payloadMutate<T>('PATCH', `/api/${args.collection}/${args.id}`, args.data, {
        unwrapDoc: true,
      })
    },
    updateGlobal: async <T>(args: { slug: string; data: unknown }) => {
      return payloadMutate<T>('POST', `/api/globals/${args.slug}`, args.data, { unwrapDoc: true })
    },
    delete: async <T>(args: { collection: string; id: number | string }) => {
      return payloadMutate<T>('DELETE', `/api/${args.collection}/${args.id}`, undefined, {
        unwrapDoc: false,
      })
    },
  }
}

export type AdminPayloadClient = Awaited<ReturnType<typeof getAdminPayload>>

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
