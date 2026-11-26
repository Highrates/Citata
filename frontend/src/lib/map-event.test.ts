import assert from 'node:assert/strict'
import test from 'node:test'
import { events } from '@/content/events'
import {
  mapEventToPayloadData,
  mapPayloadEventToEvent,
  type PayloadEvent,
} from '@/lib/map-event'

test('fixture events that are featured have homeOrder', () => {
  for (const item of events) {
    if (!item.featured) continue
    assert.equal(typeof item.homeOrder, 'number')
    assert.ok((item.homeOrder as number) >= 1)
  }
})

test('mapPayloadEventToEvent maps cover, cases and home fields', () => {
  const doc = {
    id: 7,
    slug: 'demo-event',
    title: 'Demo event',
    excerpt: 'Кратко',
    cover: {
      id: 10,
      alt: 'Обложка',
      url: 'https://cdn.example.com/cover.jpg',
      updatedAt: '',
      createdAt: '',
    },
    author: {
      id: 2,
      name: 'Анастасия',
      role: 'Автор',
      updatedAt: '',
      createdAt: '',
    },
    cases: [
      {
        id: 3,
        slug: 'bohicare',
        title: 'Bohicare',
        cover: 1,
        sortOrder: 1,
        updatedAt: '',
        createdAt: '',
      },
    ],
    publishedAt: '2025-01-01',
    readingTime: 5,
    featured: true,
    homeOrder: 2,
    status: 'published',
    description: '<p>Текст</p>',
    meta: { title: 'SEO', description: 'Desc' },
    updatedAt: '',
    createdAt: '',
  } as PayloadEvent

  const mapped = mapPayloadEventToEvent(doc)
  assert.equal(mapped.slug, 'demo-event')
  assert.equal(mapped.cover, 'https://cdn.example.com/cover.jpg')
  assert.equal(mapped.featured, true)
  assert.equal(mapped.homeOrder, 2)
  assert.equal(mapped.status, 'published')
  assert.deepEqual(mapped.cases, [{ id: 3, slug: 'bohicare', title: 'Bohicare' }])
  assert.deepEqual(mapped.seo, { title: 'SEO', description: 'Desc' })
})

test('mapEventToPayloadData clears homeOrder when not featured', () => {
  const fixture = events[0]
  assert.ok(fixture)
  const payload = mapEventToPayloadData(
    { ...fixture, featured: false, homeOrder: 9 },
    { coverId: 1, authorId: 2, caseIds: [3] },
  )
  assert.equal(payload.featured, false)
  assert.equal(payload.homeOrder, null)
  assert.deepEqual(payload.cases, [3])
  assert.equal(payload.cover, 1)
  assert.equal(payload.author, 2)
})

test('mapEventToPayloadData keeps homeOrder when featured', () => {
  const fixture = events.find((e) => e.featured && e.homeOrder != null)
  assert.ok(fixture)
  const payload = mapEventToPayloadData(fixture, { coverId: 11 })
  assert.equal(payload.featured, true)
  assert.equal(payload.homeOrder, fixture.homeOrder)
})
