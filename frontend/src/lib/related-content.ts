import type { Article, Case, Event } from '@/content/types'

function publishedMs(iso: string) {
  return new Date(iso).getTime()
}

/** Prefer events that share cases with the current one; then newer. */
export function pickRelatedEvents(all: Event[], current: Event, limit = 4): Event[] {
  const caseSlugs = new Set((current.cases ?? []).map((c) => c.slug).filter(Boolean))
  return [...all]
    .filter((item) => item.slug !== current.slug)
    .map((item) => {
      const shared = (item.cases ?? []).reduce(
        (n, c) => n + (caseSlugs.has(c.slug) ? 1 : 0),
        0,
      )
      return { item, shared, publishedAt: publishedMs(item.publishedAt) }
    })
    .sort((a, b) => {
      if (b.shared !== a.shared) return b.shared - a.shared
      return b.publishedAt - a.publishedAt
    })
    .slice(0, limit)
    .map((row) => row.item)
}

/**
 * Prefer cases co-mentioned in events for this case, then same year,
 * then works list order.
 */
export function pickRelatedCases(
  all: Case[],
  current: Case,
  eventsForCase: Event[],
  limit = 3,
): Case[] {
  const viaEvents = new Set<string>()
  for (const event of eventsForCase) {
    for (const ref of event.cases ?? []) {
      if (ref.slug && ref.slug !== current.slug) viaEvents.add(ref.slug)
    }
  }

  return [...all]
    .filter((item) => item.slug !== current.slug)
    .map((item) => ({
      item,
      viaEvent: viaEvents.has(item.slug) ? 1 : 0,
      sameYear: current.year && item.year === current.year ? 1 : 0,
      sortOrder: item.sortOrder ?? 0,
    }))
    .sort((a, b) => {
      if (b.viaEvent !== a.viaEvent) return b.viaEvent - a.viaEvent
      if (b.sameYear !== a.sameYear) return b.sameYear - a.sameYear
      return a.sortOrder - b.sortOrder
    })
    .slice(0, limit)
    .map((row) => row.item)
}

/** Prefer same author, then newer. */
export function pickRelatedArticles(all: Article[], current: Article, limit = 4): Article[] {
  const author = current.author?.name?.trim().toLowerCase() ?? ''
  return [...all]
    .filter((item) => item.slug !== current.slug)
    .map((item) => ({
      item,
      sameAuthor:
        author && item.author?.name?.trim().toLowerCase() === author ? 1 : 0,
      publishedAt: publishedMs(item.publishedAt),
    }))
    .sort((a, b) => {
      if (b.sameAuthor !== a.sameAuthor) return b.sameAuthor - a.sameAuthor
      return b.publishedAt - a.publishedAt
    })
    .slice(0, limit)
    .map((row) => row.item)
}
