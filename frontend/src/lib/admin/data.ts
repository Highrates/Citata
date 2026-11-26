import 'server-only'

import type { Article, Case, Event, PressMention, Service, SiteSettings } from '@/content/types'
import { getArticles, getCaseBySlug, getCases, getEvents } from '@/lib/content'
import { getFixturePressMentions } from '@/lib/content-press'
import { getFixtureServices } from '@/lib/content-services'
import { hasPayloadApiKey, payloadGet, type PayloadListResponse } from '@/lib/api/payload-client'
import { hasValidAdminSessionCookie } from '@/lib/admin/session'
import { fetchAllPages } from '@/lib/admin/paginate'
import { mapPayloadArticleToArticle } from '@/lib/map-article'
import { mapPayloadCaseToCase } from '@/lib/map-case'
import { mapPayloadEventToEvent, type PayloadEvent } from '@/lib/map-event'
import { mapPayloadPressMentionToPressMention } from '@/lib/map-press'
import { mapPayloadServiceToService } from '@/lib/map-service'
import { mapPayloadSiteSettingsToSiteSettings } from '@/lib/map-site'
import type {
  Article as PayloadArticle,
  Case as PayloadCase,
  PressMention as PayloadPressMention,
  Service as PayloadService,
  SiteSetting,
} from '@/payload-types'

export type AdminDataSource = 'payload' | 'fixtures'

async function requireAdminDataAccess() {
  if (!(await hasValidAdminSessionCookie())) {
    throw new Error('Unauthorized')
  }
}

async function tryPayload<T>(loader: () => Promise<T>): Promise<T | null> {
  if (!process.env.API_URL && !hasPayloadApiKey()) return null
  try {
    return await loader()
  } catch {
    return null
  }
}

async function fetchAllPayloadCases(): Promise<Case[]> {
  const docs = await fetchAllPages<PayloadCase>((page, limit) =>
    payloadGet<PayloadListResponse<PayloadCase>>(
      '/api/cases',
      { depth: 2, limit, page, sort: 'sortOrder' },
      { auth: hasPayloadApiKey() },
    ),
  )
  return docs.map(mapPayloadCaseToCase)
}

async function fetchAllPayloadArticles(): Promise<Article[]> {
  const docs = await fetchAllPages<PayloadArticle>((page, limit) =>
    payloadGet<PayloadListResponse<PayloadArticle>>(
      '/api/articles',
      { depth: 2, limit, page, sort: '-publishedAt' },
      { auth: hasPayloadApiKey() },
    ),
  )
  return docs.map(mapPayloadArticleToArticle)
}

async function fetchAllPayloadEvents(): Promise<Event[]> {
  const docs = await fetchAllPages<PayloadEvent>((page, limit) =>
    payloadGet<PayloadListResponse<PayloadEvent>>(
      '/api/events',
      { depth: 2, limit, page, sort: '-publishedAt' },
      { auth: hasPayloadApiKey() },
    ),
  )
  return docs.map(mapPayloadEventToEvent)
}

async function fetchAllPayloadServices(): Promise<Service[]> {
  const docs = await fetchAllPages<PayloadService>((page, limit) =>
    payloadGet<PayloadListResponse<PayloadService>>(
      '/api/services',
      { depth: 1, limit, page, sort: 'sortOrder' },
      { auth: hasPayloadApiKey() },
    ),
  )
  return docs.map(mapPayloadServiceToService)
}

async function fetchAllPayloadPress(): Promise<PressMention[]> {
  const docs = await fetchAllPages<PayloadPressMention>((page, limit) =>
    payloadGet<PayloadListResponse<PayloadPressMention>>(
      '/api/press-mentions',
      { depth: 0, limit, page, sort: 'sortOrder' },
      { auth: hasPayloadApiKey() },
    ),
  )
  return docs.map(mapPayloadPressMentionToPressMention)
}

export async function fetchAdminCases(): Promise<{ items: Case[]; source: AdminDataSource }> {
  await requireAdminDataAccess()
  const fromPayload = await tryPayload(fetchAllPayloadCases)
  if (fromPayload) return { items: fromPayload, source: 'payload' }
  return { items: getCases(), source: 'fixtures' }
}

export async function fetchAdminCaseBySlug(
  slug: string,
): Promise<{ item: Case | undefined; source: AdminDataSource }> {
  await requireAdminDataAccess()
  const fromPayload = await tryPayload(async () => {
    const result = await payloadGet<PayloadListResponse<PayloadCase>>(
      '/api/cases',
      {
        'where[slug][equals]': slug,
        depth: 2,
        limit: 1,
      },
      { auth: hasPayloadApiKey() },
    )
    const doc = result.docs[0]
    return doc ? mapPayloadCaseToCase(doc) : undefined
  })

  if (fromPayload !== null) {
    return { item: fromPayload, source: 'payload' }
  }

  return { item: getCaseBySlug(slug), source: 'fixtures' }
}

export async function fetchAdminArticles(): Promise<{ items: Article[]; source: AdminDataSource }> {
  await requireAdminDataAccess()
  const fromPayload = await tryPayload(fetchAllPayloadArticles)
  if (fromPayload) return { items: fromPayload, source: 'payload' }
  return { items: getArticles(), source: 'fixtures' }
}

export async function fetchAdminArticleBySlug(
  slug: string,
): Promise<{ item: Article | undefined; source: AdminDataSource }> {
  await requireAdminDataAccess()
  const fromPayload = await tryPayload(async () => {
    const result = await payloadGet<PayloadListResponse<PayloadArticle>>(
      '/api/articles',
      {
        'where[slug][equals]': slug,
        depth: 2,
        limit: 1,
      },
      { auth: hasPayloadApiKey() },
    )
    const doc = result.docs[0]
    return doc ? mapPayloadArticleToArticle(doc) : undefined
  })

  if (fromPayload !== null) {
    return { item: fromPayload, source: 'payload' }
  }

  return { item: getArticles().find((a) => a.slug === slug), source: 'fixtures' }
}

export async function fetchAdminEvents(): Promise<{ items: Event[]; source: AdminDataSource }> {
  await requireAdminDataAccess()
  const fromPayload = await tryPayload(fetchAllPayloadEvents)
  if (fromPayload) return { items: fromPayload, source: 'payload' }
  return { items: getEvents(), source: 'fixtures' }
}

export async function fetchAdminEventBySlug(
  slug: string,
): Promise<{ item: Event | undefined; source: AdminDataSource }> {
  await requireAdminDataAccess()
  const fromPayload = await tryPayload(async () => {
    const result = await payloadGet<PayloadListResponse<PayloadEvent>>(
      '/api/events',
      {
        'where[slug][equals]': slug,
        depth: 2,
        limit: 1,
      },
      { auth: hasPayloadApiKey() },
    )
    const doc = result.docs[0]
    return doc ? mapPayloadEventToEvent(doc) : undefined
  })

  if (fromPayload !== null) {
    return { item: fromPayload, source: 'payload' }
  }

  return { item: getEvents().find((a) => a.slug === slug), source: 'fixtures' }
}

export async function fetchAdminServices(): Promise<{ items: Service[]; source: AdminDataSource }> {
  await requireAdminDataAccess()
  const fromPayload = await tryPayload(fetchAllPayloadServices)
  // Empty Payload array is truthy — don't treat it as success (public site falls back to fixtures).
  if (fromPayload && fromPayload.length > 0) {
    return { items: fromPayload, source: 'payload' }
  }
  return { items: getFixtureServices(), source: 'fixtures' }
}

export async function fetchAdminServiceBySlug(
  slug: string,
): Promise<{ item: Service | undefined; source: AdminDataSource }> {
  await requireAdminDataAccess()
  const fromPayload = await tryPayload(async () => {
    const result = await payloadGet<PayloadListResponse<PayloadService>>(
      '/api/services',
      {
        'where[slug][equals]': slug,
        depth: 1,
        limit: 1,
      },
      { auth: hasPayloadApiKey() },
    )
    const doc = result.docs[0]
    return doc ? mapPayloadServiceToService(doc) : undefined
  })

  if (fromPayload !== null) {
    return { item: fromPayload, source: 'payload' }
  }

  return { item: getFixtureServices().find((s) => s.slug === slug), source: 'fixtures' }
}

export async function fetchAdminPress(): Promise<{ items: PressMention[]; source: AdminDataSource }> {
  await requireAdminDataAccess()
  const fromPayload = await tryPayload(fetchAllPayloadPress)
  if (fromPayload) return { items: fromPayload, source: 'payload' }
  return { items: getFixturePressMentions(), source: 'fixtures' }
}

export async function fetchAdminSettings(): Promise<{
  settings: SiteSettings
  source: AdminDataSource
}> {
  await requireAdminDataAccess()
  const fromPayload = await tryPayload(async () => {
    const doc = await payloadGet<SiteSetting>(
      '/api/globals/site-settings',
      { depth: 2 },
      { auth: hasPayloadApiKey() },
    )
    return mapPayloadSiteSettingsToSiteSettings(doc)
  })

  if (fromPayload) return { settings: fromPayload, source: 'payload' }
  const { getSiteSettings } = await import('@/lib/content')
  return { settings: getSiteSettings(), source: 'fixtures' }
}
