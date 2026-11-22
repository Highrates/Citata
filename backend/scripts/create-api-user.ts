/**
 * Create / refresh local Payload admin user with API key.
 * Usage: npx tsx scripts/create-api-user.ts
 */
import crypto from 'crypto'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') })

const email = process.env.SEED_ADMIN_EMAIL || 'admin@citata-pr.ru'
const password = process.env.SEED_ADMIN_PASSWORD || 'change-me-admin-password'

async function main() {
  const payload = await getPayload({ config })
  const apiKey = crypto.randomUUID()

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
  })

  if (existing.docs[0]) {
    await payload.update({
      collection: 'users',
      id: existing.docs[0].id,
      data: {
        enableAPIKey: true,
        apiKey,
        password,
      },
    })
    console.log(`↻ updated user #${existing.docs[0].id}`)
  } else {
    const user = await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        enableAPIKey: true,
        apiKey,
      },
    })
    console.log(`+ created user #${user.id}`)
  }

  console.log(`email=${email}`)
  console.log(`API_KEY=${apiKey}`)
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
