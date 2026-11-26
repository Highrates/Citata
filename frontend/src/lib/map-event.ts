import type { Event, EventStatus, GalleryItem, RelatedCaseRef } from '@/content/types'
import type { Author, Event as PayloadEvent, Media } from '@/payload-types'
import { sectionsToHtml } from '@/lib/map-article'
import { resolveMediaAlt, resolveMediaUrl } from '@/lib/media-url'

export type { PayloadEvent }

function mediaKind(media: number | Media | null | undefined): 'image' | 'video' {
  if (!media || typeof media === 'number') return 'image'
  const mime = media.mimeType ?? ''
  if (mime.startsWith('video/')) return 'video'
  const url = media.url ?? media.filename ?? ''
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return 'video'
  return 'image'
}

function mapGallery(doc: PayloadEvent): GalleryItem[] {
  const items: GalleryItem[] = []
  for (const row of doc.gallery ?? []) {
    const src = resolveMediaUrl(row.media)
    if (!src) continue
    const mediaId =
      typeof row.media === 'number'
        ? row.media
        : row.media && typeof row.media === 'object' && 'id' in row.media
          ? row.media.id
          : undefined
    items.push({
      src,
      alt: resolveMediaAlt(row.media, doc.title),
      kind: mediaKind(row.media),
      ...(typeof mediaId === 'number' ? { mediaId } : {}),
    })
  }
  return items
}

function mapRelatedCases(raw: PayloadEvent['cases']): RelatedCaseRef[] {
  const out: RelatedCaseRef[] = []
  for (const row of raw ?? []) {
    if (typeof row === 'number') {
      out.push({ id: row, slug: '', title: '' })
      continue
    }
    if (row && typeof row === 'object' && 'slug' in row) {
      out.push({
        id: typeof row.id === 'number' ? row.id : Number(row.id) || undefined,
        slug: row.slug,
        title: row.title,
      })
    }
  }
  return out.filter((c) => c.slug)
}

export function mapPayloadEventToEvent(doc: PayloadEvent): Event {
  const coverMedia = doc.cover
  const authorRef = doc.author
  const gallery = mapGallery(doc)
  const coverFromGallery = gallery[0]?.src
  const status = (doc.status as EventStatus | null | undefined) ?? 'draft'

  return {
    id: typeof doc.id === 'number' ? doc.id : Number(doc.id) || undefined,
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt ?? '',
    cover: coverFromGallery || resolveMediaUrl(coverMedia) || '',
    coverAlt: gallery[0]?.alt || resolveMediaAlt(coverMedia, doc.title),
    author: !authorRef
      ? { name: '', role: '' }
      : typeof authorRef === 'number'
        ? { name: '', role: '' }
        : {
            name: authorRef.name,
            role: authorRef.role ?? '',
            photo: resolveMediaUrl(authorRef.photo as number | Media) || undefined,
          },
    publishedAt: doc.publishedAt,
    readingTime: doc.readingTime ?? undefined,
    featured: doc.featured ?? false,
    homeOrder: doc.homeOrder ?? null,
    status,
    description: doc.description?.trim() || undefined,
    gallery: gallery.length
      ? gallery
      : coverFromGallery || resolveMediaUrl(coverMedia)
        ? [
            {
              src: coverFromGallery || resolveMediaUrl(coverMedia) || '',
              alt: resolveMediaAlt(coverMedia, doc.title),
              kind: mediaKind(coverMedia),
            },
          ]
        : undefined,
    sections: [],
    cases: mapRelatedCases(doc.cases),
    seo: doc.meta
      ? {
          title: doc.meta.title ?? undefined,
          description: doc.meta.description ?? undefined,
        }
      : undefined,
  }
}

export function mapEventToPayloadData(
  event: Event,
  options?: {
    coverId?: number
    authorId?: number
    galleryMediaIds?: number[]
    caseIds?: number[]
  },
) {
  const status: EventStatus = event.status ?? 'published'
  return {
    title: event.title,
    slug: event.slug,
    excerpt: event.excerpt,
    cover: options?.coverId,
    ...(options?.authorId != null ? { author: options.authorId } : {}),
    cases: options?.caseIds ?? [],
    publishedAt: event.publishedAt,
    readingTime: event.readingTime,
    featured: event.featured ?? false,
    homeOrder: event.featured ? (event.homeOrder ?? null) : null,
    status,
    description: event.description || null,
    gallery: options?.galleryMediaIds?.map((media) => ({ media })),
    meta: event.seo
      ? {
          title: event.seo.title,
          description: event.seo.description,
        }
      : undefined,
  }
}

export { sectionsToHtml }
