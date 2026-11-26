import 'server-only'

import { unstable_cache } from 'next/cache'
import { events } from '@/content/events'
import type { Event } from '@/content/types'
import { fetchAllPages } from '@/lib/admin/paginate'
import { payloadGet, type PayloadListResponse } from '@/lib/api/payload-client'
import { usesPayloadContent } from '@/lib/content-source'
import { mapPayloadEventToEvent, type PayloadEvent } from '@/lib/map-event'

function sortEvents(items: Event[]) {
  return [...items].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
}

export function getFixtureEvents(): Event[] {
  return sortEvents(events)
}

const fetchPayloadEvents = unstable_cache(
  async (): Promise<Event[]> => {
    const docs = await fetchAllPages<PayloadEvent>((page, limit) =>
      payloadGet<PayloadListResponse<PayloadEvent>>('/api/events', {
        'where[status][equals]': 'published',
        depth: 2,
        limit,
        page,
        sort: '-publishedAt',
      }),
    )
    return sortEvents(docs.map(mapPayloadEventToEvent))
  },
  ['payload-events'],
  { tags: ['events'], revalidate: 300 },
)

export async function fetchEvents(): Promise<Event[]> {
  if (usesPayloadContent()) return fetchPayloadEvents()
  return getFixtureEvents()
}

export async function fetchFeaturedEvents(): Promise<Event[]> {
  const all = await fetchEvents()
  return all
    .filter(
      (a) =>
        a.featured &&
        typeof a.homeOrder === 'number' &&
        Boolean(a.cover),
    )
    .sort((a, b) => {
      const ao = a.homeOrder as number
      const bo = b.homeOrder as number
      if (ao !== bo) return ao - bo
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    })
}

async function fetchPayloadEventBySlugAnyStatus(slug: string): Promise<Event | undefined> {
  const result = await payloadGet<PayloadListResponse<PayloadEvent>>(
    '/api/events',
    {
      'where[slug][equals]': slug,
      depth: 2,
      limit: 1,
    },
    { auth: true },
  )
  const doc = result.docs[0]
  return doc ? mapPayloadEventToEvent(doc) : undefined
}

export async function fetchEventBySlug(
  slug: string,
  options?: { preview?: boolean },
): Promise<Event | undefined> {
  if (options?.preview) {
    if (usesPayloadContent()) {
      try {
        return await fetchPayloadEventBySlugAnyStatus(slug)
      } catch {
        return undefined
      }
    }
    return getFixtureEvents().find((e) => e.slug === slug)
  }

  const all = await fetchEvents()
  return all.find((a) => a.slug === slug)
}

/**
 * Reverse lookup case → events via full published-events scan.
 * Fine while the catalog is small; switch to Payload `where[cases.slug]`
 * (or a join table query) if volume grows.
 */
export async function fetchEventsForCase(caseSlug: string): Promise<Event[]> {
  const all = await fetchEvents()
  return all.filter((e) => e.cases?.some((c) => c.slug === caseSlug))
}
