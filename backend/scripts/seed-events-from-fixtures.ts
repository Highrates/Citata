/**
 * Импорт фикстур событий (бывш. новости) в Payload PostgreSQL.
 * Запуск: npm run seed:events
 */
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') })
import { events } from '../src/content/events.js'
import type { ArticleSection } from '../src/content/types.js'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'
import { ensureMedia } from './lib/ensure-media.js'

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function sectionsToHtml(sections: ArticleSection[]): string {
  return sections
    .map((section) => {
      switch (section.type) {
        case 'paragraph':
          return `<p>${escapeHtml(section.text)}</p>`
        case 'heading':
          return `<h2>${escapeHtml(section.text)}</h2>`
        case 'quote':
          return `<blockquote><p>${escapeHtml(section.text)}</p></blockquote>`
        case 'list':
          return `<ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
        default:
          return ''
      }
    })
    .filter(Boolean)
    .join('')
}

async function ensureAuthor(
  payload: Awaited<ReturnType<typeof getPayload>>,
  name: string,
  role: string,
  photoUrl?: string,
): Promise<number> {
  const photoId = photoUrl ? await ensureMedia(payload, photoUrl, name) : undefined

  const existing = await payload.find({
    collection: 'authors',
    where: { name: { equals: name } },
    limit: 1,
  })

  if (existing.docs[0]) {
    const id = existing.docs[0].id
    if (photoId || role) {
      await payload.update({
        collection: 'authors',
        id,
        data: {
          ...(role ? { role } : {}),
          ...(photoId ? { photo: photoId } : {}),
        },
      })
    }
    return id
  }

  const created = await payload.create({
    collection: 'authors',
    data: {
      name,
      role,
      ...(photoId ? { photo: photoId } : {}),
    },
  })

  return created.id
}

async function main() {
  const payload = await getPayload({ config })

  const caseSlugToId = new Map<string, number>()
  {
    const caseDocs = await payload.find({
      collection: 'cases',
      limit: 200,
      depth: 0,
    })
    for (const doc of caseDocs.docs) {
      if (doc.slug) caseSlugToId.set(doc.slug, doc.id)
    }
  }

  for (const event of events) {
    const coverId = await ensureMedia(payload, event.cover, event.coverAlt)
    const authorId = await ensureAuthor(
      payload,
      event.author.name,
      event.author.role,
      event.author.photo,
    )

    const existing = await payload.find({
      collection: 'events',
      where: { slug: { equals: event.slug } },
      limit: 1,
    })

    const description =
      event.description?.trim() ||
      (event.sections?.length ? sectionsToHtml(event.sections) : undefined)

    const caseIds = (event.cases ?? [])
      .map((c) => caseSlugToId.get(c.slug))
      .filter((id): id is number => typeof id === 'number')

    const featured = event.featured ?? false
    const data = {
      title: event.title,
      slug: event.slug,
      excerpt: event.excerpt,
      cover: coverId,
      author: authorId,
      publishedAt: event.publishedAt,
      readingTime: event.readingTime,
      featured,
      homeOrder: featured ? (event.homeOrder ?? null) : null,
      cases: caseIds,
      description,
      status: 'published' as const,
      meta: event.seo,
    }

    if (existing.docs[0]) {
      await payload.update({
        collection: 'events',
        id: existing.docs[0].id,
        data,
      })
      console.log(`↻ updated: ${event.slug}`)
    } else {
      await payload.create({
        collection: 'events',
        data,
      })
      console.log(`+ created: ${event.slug}`)
    }
  }

  console.log('✓ Events seed complete')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
