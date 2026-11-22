/**
 * Seed Payload `services` collection from frontend fixtures.
 * Usage: cd backend && npx tsx scripts/seed-services-from-fixtures.ts
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { allFixtureServices } from '../src/content/services'

async function ensureMedia(payload: Awaited<ReturnType<typeof getPayload>>, url: string, alt: string) {
  const existing = await payload.find({
    collection: 'media',
    where: { url: { equals: url } },
    limit: 1,
  })
  if (existing.docs[0]) return existing.docs[0].id as number

  const created = await payload.create({
    collection: 'media',
    data: {
      alt,
      url,
      filename: url,
    },
  })
  return created.id as number
}

async function main() {
  const payload = await getPayload({ config })

  for (const item of allFixtureServices) {
    const existing = await payload.find({
      collection: 'services',
      where: { slug: { equals: item.slug } },
      limit: 1,
    })

    const coverId = await ensureMedia(payload, item.image || '', item.coverAlt || item.title)
    const data = {
      title: item.title,
      slug: item.slug,
      description: item.description || null,
      sortOrder: item.sortOrder,
      cover: coverId,
    }

    if (existing.docs[0]) {
      await payload.update({
        collection: 'services',
        id: existing.docs[0].id,
        data,
        context: { disableRevalidate: true },
      })
      console.log('updated', item.slug)
    } else {
      await payload.create({
        collection: 'services',
        data,
        context: { disableRevalidate: true },
      })
      console.log('created', item.slug)
    }
  }

  console.log('✓ Services seed complete')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
