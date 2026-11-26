import assert from 'node:assert/strict'
import test from 'node:test'
import { articles } from '@/content/articles'
import { events } from '@/content/events'
import { validateArticle } from '@/content/article-model'
import type { Article } from '@/content/types'
import { lexicalToSections } from '@/lib/lexical-utils'
import {
  mapArticleSectionToPayloadSection,
  mapArticleToPayloadData,
  mapPayloadArticleToArticle,
  mapPayloadSectionToArticleSection,
} from '@/lib/map-article'
import type { Article as PayloadArticle } from '@/payload-types'

const sampleArticle: Article = {
  slug: 'demo-article',
  title: 'Demo',
  excerpt: 'Кратко',
  cover: 'https://cdn.example.com/cover.jpg',
  coverAlt: 'Обложка',
  author: { name: 'Ольга', role: 'Редактор' },
  publishedAt: '2025-01-01',
  readingTime: 3,
  sections: [
    { type: 'heading', text: 'Заголовок' },
    { type: 'paragraph', text: 'Текст' },
    { type: 'quote', text: 'Цитата' },
    { type: 'list', items: ['А', 'Б'] },
  ],
}

test('articles fixtures stay empty after news → events split', () => {
  assert.equal(articles.length, 0)
  assert.ok(events.length > 0)
})

test('fixture events conform to canonical article model shape', () => {
  for (const event of events) {
    assert.deepEqual(validateArticle(event), [])
    for (const section of event.sections) {
      assert.ok(section.type)
    }
  }
})

test('round-trip: fixture section → payload section → article section', () => {
  for (const section of sampleArticle.sections) {
    const payloadSection = mapArticleSectionToPayloadSection(section)
    const restored = mapPayloadSectionToArticleSection(payloadSection)
    assert.deepEqual(restored, section)
  }
})

test('mapArticleToPayloadData preserves scalar fields', () => {
  const payloadData = mapArticleToPayloadData(sampleArticle, { coverId: 1, authorId: 2 })

  assert.equal(payloadData.slug, sampleArticle.slug)
  assert.equal(payloadData.title, sampleArticle.title)
  assert.equal(payloadData.cover, 1)
  assert.equal(payloadData.author, 2)
  assert.equal(payloadData.sections.length, sampleArticle.sections.length)
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
})
