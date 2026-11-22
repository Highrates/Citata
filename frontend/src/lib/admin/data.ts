import 'server-only'

import type { Article, Case, PressMention, Service, SiteSettings } from '@/content/types'
import { getArticles, getCaseBySlug, getCases } from '@/lib/content'
import { getFixturePressMentions } from '@/lib/content-press'
import { getFixtureServices } from '@/lib/content-services'
import { hasPayloadApiKey, payloadGet, type PayloadListResponse } from '@/lib/api/payload-client'
import { mapPayloadArticleToArticle } from '@/lib/map-article'
import { mapPayloadCaseToCase } from '@/lib/map-case'
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

async function tryPayload<T>(loader: () => Promise<T>): Promise<T | null> {
  if (!process.env.API_URL && !hasPayloadApiKey()) return null
  try {
    return await loader()
  } catch {
    return null
  }
}

const ADMIN_CASES_PAGE_SIZE = 100
const ADMIN_CASES_MAX_PAGES = 50

async function fetchAllPayloadCases(): Promise<Case[]> {
  const items: Case[] = []
  let page = 1

  while (page <= ADMIN_CASES_MAX_PAGES) {
    const result = await payloadGet<PayloadListResponse<PayloadCase>>(
      '/api/cases',
      {
        depth: 2,
        limit: ADMIN_CASES_PAGE_SIZE,
        page,
        sort: 'sortOrder',
      },
      { auth: hasPayloadApiKey() },
    )
    items.push(...result.docs.map(mapPayloadCaseToCase))
    if (!result.hasNextPage) break
    page += 1
  }

  return items
}

export async function fetchAdminCases(): Promise<{ items: Case[]; source: AdminDataSource }> {
  const fromPayload = await tryPayload(fetchAllPayloadCases)

  if (fromPayload) return { items: fromPayload, source: 'payload' }
  return { items: getCases(), source: 'fixtures' }
}

export async function fetchAdminCaseBySlug(
  slug: string,
): Promise<{ item: Case | undefined; source: AdminDataSource }> {
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
  const fromPayload = await tryPayload(async () => {
    const result = await payloadGet<PayloadListResponse<PayloadArticle>>(
      '/api/articles',
      {
        depth: 2,
        limit: 200,
        sort: '-publishedAt',
      },
      { auth: hasPayloadApiKey() },
    )
    return result.docs.map(mapPayloadArticleToArticle)
  })

  if (fromPayload) return { items: fromPayload, source: 'payload' }
  return { items: getArticles(), source: 'fixtures' }
}

export async function fetchAdminArticleBySlug(
  slug: string,
): Promise<{ item: Article | undefined; source: AdminDataSource }> {
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

export async function fetchAdminServices(): Promise<{ items: Service[]; source: AdminDataSource }> {
  const fromPayload = await tryPayload(async () => {
    const result = await payloadGet<PayloadListResponse<PayloadService>>(
      '/api/services',
      {
        depth: 1,
        limit: 200,
        sort: 'sortOrder',
      },
      { auth: hasPayloadApiKey() },
    )
    return result.docs.map(mapPayloadServiceToService)
  })

  if (fromPayload) return { items: fromPayload, source: 'payload' }
  return { items: getFixtureServices(), source: 'fixtures' }
}

export async function fetchAdminServiceBySlug(
  slug: string,
): Promise<{ item: Service | undefined; source: AdminDataSource }> {
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
  const fromPayload = await tryPayload(async () => {
    const result = await payloadGet<PayloadListResponse<PayloadPressMention>>(
      '/api/press-mentions',
      {
        depth: 0,
        limit: 100,
        sort: 'sortOrder',
      },
      { auth: hasPayloadApiKey() },
    )
    return result.docs.map(mapPayloadPressMentionToPressMention)
  })

  if (fromPayload) return { items: fromPayload, source: 'payload' }
  return { items: getFixturePressMentions(), source: 'fixtures' }
}

export async function fetchAdminSettings(): Promise<{ settings: SiteSettings; source: AdminDataSource }> {
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
