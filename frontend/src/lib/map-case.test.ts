import assert from 'node:assert/strict'
import test from 'node:test'
import { cases } from '@/content/cases'
import { validateCase } from '@/content/case-model'
import { mapCaseToPayloadData, mapPayloadCaseToCase } from '@/lib/map-case'
import type { Case as PayloadCase } from '@/payload-types'

test('fixture cases conform to canonical model', () => {
  for (const caseItem of cases) {
    assert.deepEqual(validateCase(caseItem), [])
  }
})

test('fixture cases that are featured have homeOrder', () => {
  for (const item of cases) {
    if (!item.featured) continue
    assert.equal(typeof item.homeOrder, 'number')
    assert.ok((item.homeOrder as number) >= 1)
  }
})

test('mapCaseToPayloadData preserves scalar fields and SEO', () => {
  const fixture = {
    ...cases[0],
    seo: { title: 'SEO title', description: 'SEO desc' },
  }
  const payloadData = mapCaseToPayloadData(fixture, { coverId: 1 })

  assert.equal(payloadData.slug, fixture.slug)
  assert.equal(payloadData.title, fixture.title)
  assert.equal(payloadData.cover, 1)
  assert.equal(payloadData.meta?.title, 'SEO title')
  assert.equal(payloadData.meta?.description, 'SEO desc')
  assert.equal('blocks' in payloadData, false)
  assert.equal('relatedCases' in payloadData, false)
})

test('mapPayloadCaseToCase resolves cover and SEO', () => {
  const doc = {
    id: 1,
    slug: 'demo',
    title: 'Demo',
    cover: {
      id: 10,
      alt: 'Обложка',
      url: 'https://cdn.example.com/cover.jpg',
    },
    sortOrder: 1,
    description: '<p>Hello</p>',
    meta: { title: 'Demo SEO', description: 'About demo' },
    updatedAt: '',
    createdAt: '',
  } as PayloadCase

  const mapped = mapPayloadCaseToCase(doc)
  assert.equal(mapped.cover, 'https://cdn.example.com/cover.jpg')
  assert.equal(mapped.coverAlt, 'Обложка')
  assert.equal(mapped.description, '<p>Hello</p>')
  assert.deepEqual(mapped.seo, { title: 'Demo SEO', description: 'About demo' })
})
