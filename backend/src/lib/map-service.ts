import type { Service } from '@/content/types'
import { resolveMediaAlt, resolveMediaUrl } from '@/lib/media-url'
import { slugify } from '@/lib/slugify'
import type { Service as PayloadService } from '@/payload-types'

export function mapPayloadServiceToService(doc: PayloadService): Service {
  const coverUrl = resolveMediaUrl(doc.cover) || undefined
  const title = doc.title || 'Услуга'
  return {
    title,
    slug: doc.slug || slugify(title),
    description: doc.description || undefined,
    image: coverUrl,
    coverAlt: resolveMediaAlt(doc.cover, title),
    sortOrder: doc.sortOrder ?? 0,
  }
}

export function mapServiceToPayloadData(
  service: Service,
  coverId: number,
): Omit<PayloadService, 'id' | 'updatedAt' | 'createdAt' | 'cover'> & { cover: number } {
  return {
    title: service.title,
    slug: service.slug,
    description: service.description || null,
    sortOrder: service.sortOrder,
    cover: coverId,
  }
}
