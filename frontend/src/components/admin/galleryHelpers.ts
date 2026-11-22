import type { GalleryFrame } from '@/components/admin/AdminGalleryEditor'
import type { GalleryItem } from '@/content/types'

let galleryIdSeq = 0

export function nextGalleryId() {
  galleryIdSeq += 1
  return `g-${Date.now()}-${galleryIdSeq}`
}

export function kindFromFile(file: File): 'image' | 'video' {
  if (file.type.startsWith('video/')) return 'video'
  return 'image'
}

export function kindFromSrc(src: string, mime?: string): 'image' | 'video' {
  if (mime?.startsWith('video/')) return 'video'
  if (/\.(mp4|webm|mov)(\?|$)/i.test(src)) return 'video'
  return 'image'
}

export function toGalleryFrames(items: GalleryItem[]): GalleryFrame[] {
  return items.map((g) => ({ ...g, id: nextGalleryId() }))
}

export function serializeGallery(frames: GalleryFrame[]): GalleryItem[] {
  return frames.map(({ src, alt, kind }) => ({ src, alt, kind }))
}

export function initialCoverGallery(opts: {
  gallery?: GalleryItem[]
  cover?: string
  coverAlt?: string
  title?: string
}): GalleryFrame[] {
  if (opts.gallery?.length) return toGalleryFrames(opts.gallery)
  if (opts.cover) {
    return toGalleryFrames([
      {
        src: opts.cover,
        alt: opts.coverAlt || opts.title || '',
        kind: kindFromSrc(opts.cover),
      },
    ])
  }
  return []
}

/** Compare snapshots ignoring ephemeral gallery frame ids. */
export function snapshotsEqualWithGallery<T extends { gallery: GalleryFrame[] }>(a: T, b: T) {
  const strip = (s: T) => ({
    ...s,
    gallery: serializeGallery(s.gallery),
  })
  return JSON.stringify(strip(a)) === JSON.stringify(strip(b))
}
