import assert from 'node:assert/strict'
import test from 'node:test'
import type { Case, Event } from '@/content/types'
import { pickRelatedCases, pickRelatedEvents } from '@/lib/related-content'

const baseEvent = (partial: Partial<Event> & Pick<Event, 'slug' | 'title'>): Event => ({
  excerpt: '',
  cover: '/x.jpg',
  coverAlt: '',
  author: { name: 'A', role: '' },
  publishedAt: '2025-01-01',
  readingTime: 3,
  sections: [],
  ...partial,
})

const baseCase = (partial: Partial<Case> & Pick<Case, 'slug' | 'title' | 'sortOrder'>): Case => ({
  cover: '/x.jpg',
  coverAlt: '',
  ...partial,
})

test('pickRelatedEvents prefers shared cases over recency alone', () => {
  const current = baseEvent({
    slug: 'current',
    title: 'Current',
    publishedAt: '2025-06-01',
    cases: [{ slug: 'bohicare', title: 'Bohicare' }],
  })
  const sharedOlder = baseEvent({
    slug: 'shared-old',
    title: 'Shared',
    publishedAt: '2024-01-01',
    cases: [{ slug: 'bohicare', title: 'Bohicare' }],
  })
  const newerUnrelated = baseEvent({
    slug: 'new',
    title: 'New',
    publishedAt: '2025-12-01',
  })

  const related = pickRelatedEvents([current, sharedOlder, newerUnrelated], current, 2)
  assert.deepEqual(
    related.map((e) => e.slug),
    ['shared-old', 'new'],
  )
})

test('pickRelatedCases prefers co-mentioned via events, then same year', () => {
  const current = baseCase({ slug: 'a', title: 'A', sortOrder: 1, year: 2024 })
  const viaEvent = baseCase({ slug: 'b', title: 'B', sortOrder: 9, year: 2020 })
  const sameYear = baseCase({ slug: 'c', title: 'C', sortOrder: 2, year: 2024 })
  const other = baseCase({ slug: 'd', title: 'D', sortOrder: 3, year: 2019 })
  const events: Event[] = [
    baseEvent({
      slug: 'ev',
      title: 'Ev',
      cases: [
        { slug: 'a', title: 'A' },
        { slug: 'b', title: 'B' },
      ],
    }),
  ]

  const related = pickRelatedCases([current, viaEvent, sameYear, other], current, events, 3)
  assert.deepEqual(
    related.map((c) => c.slug),
    ['b', 'c', 'd'],
  )
})
