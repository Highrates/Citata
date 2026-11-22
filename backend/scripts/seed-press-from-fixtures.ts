/**
 * Импорт фикстур прессы в Payload.
 * Запуск: npm run seed:press
 */
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') })
import { pressMentions } from '../src/content/press.js'
import { mapPressMentionToPayloadData } from '../src/lib/map-press.js'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'

async function main() {
  const payload = await getPayload({ config })

  for (const item of pressMentions) {
    const existing = await payload.find({
      collection: 'press-mentions',
      where: { url: { equals: item.url } },
      limit: 1,
    })

    const data = mapPressMentionToPayloadData(item)

    if (existing.docs[0]) {
      await payload.update({
        collection: 'press-mentions',
        id: existing.docs[0].id,
        data,
      })
      console.log(`↻ updated: ${item.title}`)
    } else {
      await payload.create({
        collection: 'press-mentions',
        data,
      })
      console.log(`+ created: ${item.title}`)
    }
  }

  console.log('✓ Press seed complete')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
