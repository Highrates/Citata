import 'server-only'

import { unstable_cache } from 'next/cache'
import { cases } from '@/content/cases'
import type { Case } from '@/content/types'
import { fetchAllPages } from '@/lib/admin/paginate'
import { buildPayloadWhereParams } from '@/lib/admin/payload-where'
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
  // Homepage uses shared homeOrder (with events); sortOrder is for /works only
  return all
    .filter(
      (c) =>
        c.featured &&
        (c.status ?? 'published') === 'published' &&
        typeof c.homeOrder === 'number' &&
        Boolean(c.cover),
    )
    .sort((a, b) => {
      const ao = a.homeOrder as number
      const bo = b.homeOrder as number
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

/** Fetch only the requested published cases (event materials) — not the full catalog. */
export async function fetchCasesBySlugs(slugs: string[]): Promise<Case[]> {
  const unique = [...new Set(slugs.map((s) => s.trim()).filter(Boolean))]
  if (!unique.length) return []

  if (!usesPayloadContent()) {
    const wanted = new Set(unique)
    return getFixtureCases().filter((c) => wanted.has(c.slug))
  }

  try {
    const where =
      unique.length === 1
        ? {
            and: [{ status: { equals: 'published' } }, { slug: { equals: unique[0] } }],
          }
        : {
            and: [
              { status: { equals: 'published' } },
              { or: unique.map((slug) => ({ slug: { equals: slug } })) },
            ],
          }

    const result = await payloadGet<PayloadListResponse<PayloadCase>>('/api/cases', {
      ...buildPayloadWhereParams(where),
      depth: 2,
      limit: unique.length,
    })
    const bySlug = new Map(result.docs.map((doc) => [doc.slug, mapPayloadCaseToCase(doc)]))
    return unique.map((slug) => bySlug.get(slug)).filter((c): c is Case => Boolean(c))
  } catch {
    return []
  }
}

