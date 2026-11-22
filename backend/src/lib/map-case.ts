import type { Case, CaseGalleryItem, CaseStatus } from '@/content/types'
import type { Case as PayloadCase, Media } from '@/payload-types'
import { resolveMediaAlt, resolveMediaUrl } from '@/lib/media-url'

function mediaKind(media: number | Media | null | undefined): 'image' | 'video' {
  if (!media || typeof media === 'number') return 'image'
  const mime = media.mimeType ?? ''
  if (mime.startsWith('video/')) return 'video'
  const url = media.url ?? media.filename ?? ''
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return 'video'
  return 'image'
}

function mapGallery(doc: PayloadCase): CaseGalleryItem[] {
  const items: CaseGalleryItem[] = []
  for (const row of doc.gallery ?? []) {
    const src = resolveMediaUrl(row.media)
    if (!src) continue
    items.push({
      src,
      alt: resolveMediaAlt(row.media, doc.title),
      kind: mediaKind(row.media),
    })
  }
  return items
}

export function mapPayloadCaseToCase(doc: PayloadCase): Case {
  const coverMedia = doc.cover as number | Media
  const gallery = mapGallery(doc)
  const coverFromGallery = gallery[0]?.src
  const cover = coverFromGallery || resolveMediaUrl(coverMedia) || ''
  const coverAlt = gallery[0]?.alt || resolveMediaAlt(coverMedia, doc.title)

  const status = (doc.status as CaseStatus | null | undefined) ?? 'draft'

  return {
    slug: doc.slug,
    title: doc.title,
    year: doc.year ?? undefined,
    cover,
    coverAlt,
    summary: doc.summary ?? undefined,
    description: doc.description ?? undefined,
    heroTitle: doc.heroTitle ?? undefined,
    featured: doc.featured ?? false,
    status,
    sortOrder: doc.sortOrder ?? 0,
    gallery: gallery.length ? gallery : undefined,
    seo: doc.meta
      ? {
          title: doc.meta.title ?? undefined,
          description: doc.meta.description ?? undefined,
        }
      : undefined,
  }
}

/** Данные для create/update в Payload (без cover/gallery — нужны ID медиа) */
export function mapCaseToPayloadData(
  caseData: Case,
  options?: {
    coverId?: number
    galleryMediaIds?: number[]
  },
) {
  const status = caseData.status ?? 'published'
  return {
    title: caseData.title,
    slug: caseData.slug,
    year: caseData.year,
    summary: caseData.summary,
    description: caseData.description,
    heroTitle: caseData.heroTitle,
    featured: caseData.featured ?? false,
    sortOrder: caseData.sortOrder,
    cover: options?.coverId,
    gallery: options?.galleryMediaIds?.map((media) => ({ media })),
    status,
    meta: {
      title: caseData.seo?.title || undefined,
      description: caseData.seo?.description || undefined,
    },
  }
}
