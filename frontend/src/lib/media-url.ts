import type { Media } from '@/payload-types'

const s3PublicBase = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, '')
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

export function resolveMediaUrl(media: number | Media | null | undefined): string | undefined {
  if (!media || typeof media === 'number') return undefined

  if (media.url) {
    if (media.url.startsWith('http')) return media.url
    if (media.url.startsWith('/')) return `${siteUrl}${media.url}`
    return media.url
  }

  if (s3PublicBase && media.filename) {
    return `${s3PublicBase}/${media.filename}`
  }

  return undefined
}

export function resolveMediaAlt(media: number | Media | null | undefined, fallback = ''): string {
  if (!media || typeof media === 'number') return fallback
  return media.alt || fallback
}
