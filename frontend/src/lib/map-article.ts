import type { Article, ArticleSection, ArticleStatus, GalleryItem } from '@/content/types'
import type { Article as PayloadArticle, Author, Media } from '@/payload-types'
import { lexicalToSections } from '@/lib/lexical-utils'
import { resolveMediaAlt, resolveMediaUrl } from '@/lib/media-url'

type PayloadArticleSection = NonNullable<PayloadArticle['sections']>[number]

/** Legacy: поле `content` с Lexical до унификации схемы */
type LegacyArticleContent = {
  content?: Parameters<typeof lexicalToSections>[0]
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function sectionsToHtml(sections: ArticleSection[]): string {
  return sections
    .map((section) => {
      switch (section.type) {
        case 'paragraph':
          return `<p>${escapeHtml(section.text)}</p>`
        case 'heading':
          return `<h2>${escapeHtml(section.text)}</h2>`
        case 'quote':
          return `<blockquote><p>${escapeHtml(section.text)}</p></blockquote>`
        case 'list':
          return `<ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
        default:
          return ''
      }
    })
    .filter(Boolean)
    .join('')
}

function mediaKind(media: number | Media | null | undefined): 'image' | 'video' {
  if (!media || typeof media === 'number') return 'image'
  const mime = media.mimeType ?? ''
  if (mime.startsWith('video/')) return 'video'
  const url = media.url ?? media.filename ?? ''
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return 'video'
  return 'image'
}

function mapGallery(doc: PayloadArticle): GalleryItem[] {
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

export function mapPayloadSectionToArticleSection(
  section: PayloadArticleSection,
): ArticleSection | null {
  switch (section.blockType) {
    case 'paragraph':
      return { type: 'paragraph', text: section.text }

    case 'heading':
      return { type: 'heading', text: section.text }

    case 'quote':
      return { type: 'quote', text: section.text }

    case 'list':
      return {
        type: 'list',
        items: (section.items ?? []).map((item) => item.text),
      }

    default:
      return null
  }
}

export function mapPayloadArticleToArticle(doc: PayloadArticle & LegacyArticleContent): Article {
  const coverMedia = doc.cover as number | Media
  const authorRef = doc.author as number | Author
  const gallery = mapGallery(doc)
  const coverFromGallery = gallery[0]?.src

  const sectionsFromBlocks = (doc.sections ?? [])
    .map(mapPayloadSectionToArticleSection)
    .filter((section): section is ArticleSection => Boolean(section))

  const sections =
    sectionsFromBlocks.length > 0
      ? sectionsFromBlocks
      : lexicalToSections(doc.content)

  const description =
    doc.description?.trim() ||
    (sections.length ? sectionsToHtml(sections) : undefined)

  const status = (doc.status as ArticleStatus | null | undefined) ?? 'draft'

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
    status,
    description,
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
    sections,
    seo: doc.meta
      ? {
          title: doc.meta.title ?? undefined,
          description: doc.meta.description ?? undefined,
        }
      : undefined,
  }
}

export function mapArticleSectionToPayloadSection(section: ArticleSection): PayloadArticleSection {
  switch (section.type) {
    case 'paragraph':
      return { blockType: 'paragraph', text: section.text }

    case 'heading':
      return { blockType: 'heading', text: section.text }

    case 'quote':
      return { blockType: 'quote', text: section.text }

    case 'list':
      return {
        blockType: 'list',
        items: section.items.map((text) => ({ text })),
      }
  }
}

export function mapArticleToPayloadData(
  article: Article,
  options?: { coverId?: number; authorId?: number; galleryMediaIds?: number[] },
) {
  const status: ArticleStatus = article.status ?? 'published'
  return {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    cover: options?.coverId,
    ...(options?.authorId != null ? { author: options.authorId } : {}),
    publishedAt: article.publishedAt,
    readingTime: article.readingTime,
    status,
    description: article.description || null,
    gallery: options?.galleryMediaIds?.map((media) => ({ media })),
    sections: article.sections.map(mapArticleSectionToPayloadSection),
    meta: article.seo
      ? {
          title: article.seo.title,
          description: article.seo.description,
        }
      : undefined,
  }
}
