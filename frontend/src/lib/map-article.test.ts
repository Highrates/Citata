import assert from 'node:assert/strict'
import test from 'node:test'
import { articles } from '@/content/articles'
import { events } from '@/content/events'
import { validateArticle } from '@/content/article-model'
import { lexicalToSections } from '@/lib/lexical-utils'
import {
  mapArticleSectionToPayloadSection,
  mapArticleToPayloadData,
  mapPayloadArticleToArticle,
  mapPayloadSectionToArticleSection,
} from '@/lib/map-article'
import type { Article as PayloadArticle } from '@/payload-types'

test('fixture articles section starts empty after events split', () => {
  assert.equal(articles.length, 0)
})

test('fixture events (former news) conform to canonical article model', () => {
  for (const item of events) {
    assert.deepEqual(validateArticle(item), [])
    for (const section of item.sections) {
      assert.ok(section.type)
    }
  }
})

test('round-trip: fixture section → payload section → article section', () => {
  const fixture = events[0]
  assert.ok(fixture)
  for (const section of fixture.sections) {
    const payloadSection = mapArticleSectionToPayloadSection(section)
    const restored = mapPayloadSectionToArticleSection(payloadSection)
    assert.deepEqual(restored, section)
  }
})

test('mapArticleToPayloadData preserves scalar fields', () => {
  const fixture = events[0]
  assert.ok(fixture)
  const payloadData = mapArticleToPayloadData(fixture, { coverId: 1, authorId: 2 })

  assert.equal(payloadData.slug, fixture.slug)
  assert.equal(payloadData.title, fixture.title)
  assert.equal(payloadData.cover, 1)
  assert.equal(payloadData.author, 2)
  assert.equal(payloadData.sections.length, fixture.sections.length)
})

test('legacy richText content maps to sections', () => {
  const legacyContent = {
    root: {
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: 'Вступление' }],
        },
        {
          type: 'heading',
          tag: 'h3',
          children: [{ type: 'text', text: 'Заголовок' }],
        },
        {
          type: 'list',
          listType: 'bullet',
          children: [
            {
              type: 'listitem',
              children: [{ type: 'text', text: 'Пункт 1' }],
            },
          ],
        },
      ],
    },
  }

  const sections = lexicalToSections(legacyContent)
  assert.deepEqual(sections, [
    { type: 'paragraph', text: 'Вступление' },
    { type: 'heading', text: 'Заголовок' },
    { type: 'list', items: ['Пункт 1'] },
  ])
})

test('mapPayloadArticleToArticle resolves cover, author and sections', () => {
  const doc = {
    id: 1,
    slug: 'demo',
    title: 'Demo',
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
      name: 'Ольга Трегубова',
      role: 'Редактор',
      updatedAt: '',
      createdAt: '',
    },
    publishedAt: '2025-01-01',
    readingTime: 4,
    sections: [{ blockType: 'paragraph', text: 'Hello' }],
    updatedAt: '',
    createdAt: '',
  } as PayloadArticle

  const mapped = mapPayloadArticleToArticle(doc)
  assert.equal(mapped.cover, 'https://cdn.example.com/cover.jpg')
  assert.equal(mapped.coverAlt, 'Обложка')
  assert.deepEqual(mapped.author, { name: 'Ольга Трегубова', role: 'Редактор', photo: undefined })
  assert.deepEqual(mapped.sections, [{ type: 'paragraph', text: 'Hello' }])
  assert.equal(mapped.description, '<p>Hello</p>')
  assert.equal(mapped.status, 'draft')
})
