import 'server-only'

import { unstable_cache } from 'next/cache'
import { cases } from '@/content/cases'
import type { Case } from '@/content/types'
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
    const result = await payloadGet<PayloadListResponse<PayloadCase>>('/api/cases', {
      'where[status][equals]': 'published',
      depth: 2,
      limit: 200,
      sort: 'sortOrder',
    })
    return sortCases(result.docs.map(mapPayloadCaseToCase))
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
  // Same ascending sortOrder as admin/cases (drag order); only published
  return all
    .filter((c) => c.featured && (c.status ?? 'published') === 'published')
    .sort((a, b) => a.sortOrder - b.sortOrder)
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

