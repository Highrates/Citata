/**
 * Импорт фикстур статей в Payload PostgreSQL.
 * Запуск: npm run seed:articles
 */
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') })
import { articles } from '../src/content/articles.js'
import { mapArticleSectionToPayloadSection } from '../src/lib/map-article.js'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'
import { ensureMedia } from './lib/ensure-media.js'

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

  for (const article of articles) {
    const coverId = await ensureMedia(payload, article.cover, article.coverAlt)
    const authorId = await ensureAuthor(
      payload,
      article.author.name,
      article.author.role,
      article.author.photo,
    )

    const existing = await payload.find({
      collection: 'articles',
      where: { slug: { equals: article.slug } },
      limit: 1,
    })

    const data = {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      cover: coverId,
      author: authorId,
      publishedAt: article.publishedAt,
      readingTime: article.readingTime,
      featured: article.featured ?? false,
      sections: article.sections.map(mapArticleSectionToPayloadSection),
      status: 'published' as const,
      meta: article.seo,
    }

    if (existing.docs[0]) {
      await payload.update({
        collection: 'articles',
        id: existing.docs[0].id,
        data,
      })
      console.log(`↻ updated: ${article.slug}`)
    } else {
      await payload.create({
        collection: 'articles',
        data,
      })
      console.log(`+ created: ${article.slug}`)
    }
  }

  console.log('✓ Articles seed complete')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
