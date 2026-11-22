import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Payload } from 'payload'

const here = path.dirname(fileURLToPath(import.meta.url))
const frontendPublic = path.resolve(here, '../../../frontend/public')

/** Stable short filename from a remote CDN URL or local path. */
export function filenameFromUrl(url: string): string {
  try {
    if (url.startsWith('/')) {
      return path.basename(url).slice(0, 180)
    }
    const raw = decodeURIComponent(new URL(url).pathname.split('/').pop() || 'file')
    const cleaned = raw.replace(/[^\w.\-()+ ]+/g, '_').trim()
    return (cleaned || 'file').slice(0, 180)
  } catch {
    return `file-${Buffer.from(url).toString('base64url').slice(0, 32)}`
  }
}

function mimeFromName(name: string): string {
  const ext = path.extname(name).toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.gif') return 'image/gif'
  return 'image/jpeg'
}

/** Reuse media by URL (or filename) so shared covers don't fail unique constraints. */
export async function ensureMedia(payload: Payload, url: string, alt: string): Promise<number> {
  const byUrl = await payload.find({
    collection: 'media',
    where: { url: { equals: url } },
    limit: 1,
  })
  if (byUrl.docs[0]) return byUrl.docs[0].id as number

  const filename = filenameFromUrl(url)
  const byName = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })
  if (byName.docs[0]) return byName.docs[0].id as number

  // Local public assets (e.g. /images/cases/foo.jpg) — upload from disk
  if (url.startsWith('/')) {
    const localPath = path.join(frontendPublic, url.replace(/^\//, ''))
    if (!fs.existsSync(localPath)) {
      throw new Error(`Local media not found: ${localPath}`)
    }
    const data = fs.readFileSync(localPath)
    const created = await payload.create({
      collection: 'media',
      data: { alt },
      file: {
        data,
        mimetype: mimeFromName(filename),
        name: filename,
        size: data.length,
      },
    })
    return created.id as number
  }

  const created = await payload.create({
    collection: 'media',
    data: {
      alt,
      filename,
      url,
    },
  })

  return created.id as number
}
