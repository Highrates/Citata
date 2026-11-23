import 'server-only'

import { unstable_cache } from 'next/cache'
import { cases } from '@/content/cases'
import type { Case } from '@/content/types'
import { fetchAllPages } from '@/lib/admin/paginate'
import { payloadGet, type PayloadListResponse } from '@/lib/api/payload-client'
import { usesPayloadContent } from '@/lib/content-source'
import { mapPayloadCaseToCase } from '@/lib/map-case'
import type { Case as PayloadCase } from '@/payload-types'

function sortCases(items: Case[]) {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getFixtureCases(): Case[] {
  return sortCases(cases)
}

const fetchPayloadCases = unstable_cache(
  async (): Promise<Case[]> => {
    const docs = await fetchAllPages<PayloadCase>((page, limit) =>
      payloadGet<PayloadListResponse<PayloadCase>>('/api/cases', {
        'where[status][equals]': 'published',
        depth: 2,
        limit,
        page,
        sort: 'sortOrder',
      }),
    )
    return sortCases(docs.map(mapPayloadCaseToCase))
  },
  ['payload-cases'],
  { tags: ['cases'], revalidate: 300 },
)

export async function fetchCases(): Promise<Case[]> {
  if (usesPayloadContent()) return fetchPayloadCases()
  return getFixtureCases()
}

export async function fetchFeaturedCases(): Promise<Case[]> {
  const all = await fetchCases()
  // Homepage uses shared homeOrder (with articles); sortOrder is for /works only
  return all
    .filter((c) => c.featured && (c.status ?? 'published') === 'published')
    .sort((a, b) => {
      const ao = a.homeOrder ?? Number.MAX_SAFE_INTEGER
      const bo = b.homeOrder ?? Number.MAX_SAFE_INTEGER
      if (ao !== bo) return ao - bo
      return a.title.localeCompare(b.title, 'ru')
    })
}

async function fetchPayloadCaseBySlugAnyStatus(slug: string): Promise<Case | undefined> {
  const result = await payloadGet<PayloadListResponse<PayloadCase>>(
    '/api/cases',
    {
      'where[slug][equals]': slug,
      depth: 2,
      limit: 1,
    },
    { auth: true },
  )
  const doc = result.docs[0]
  return doc ? mapPayloadCaseToCase(doc) : undefined
}

export async function fetchCaseBySlug(
  slug: string,
  options?: { preview?: boolean },
): Promise<Case | undefined> {
  if (options?.preview) {
    if (usesPayloadContent()) {
      try {
        return await fetchPayloadCaseBySlugAnyStatus(slug)
      } catch {
        return undefined
      }
    }
    return getFixtureCases().find((c) => c.slug === slug)
  }

  const all = await fetchCases()
  return all.find((c) => c.slug === slug)
}

