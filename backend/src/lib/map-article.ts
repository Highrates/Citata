import type { Article, ArticleSection } from '@/content/types'
import type { Article as PayloadArticle, Author, Media } from '@/payload-types'
import { lexicalToSections } from '@/lib/lexical-utils'
import { resolveMediaAlt, resolveMediaUrl } from '@/lib/media-url'

type PayloadArticleSection = NonNullable<PayloadArticle['sections']>[number]

/** Legacy: поле `content` с Lexical до унификации схемы */
type LegacyArticleContent = {
  content?: Parameters<typeof lexicalToSections>[0]
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

  const sectionsFromBlocks = (doc.sections ?? [])
    .map(mapPayloadSectionToArticleSection)
    .filter((section): section is ArticleSection => Boolean(section))

  const sections =
    sectionsFromBlocks.length > 0
      ? sectionsFromBlocks
      : lexicalToSections(doc.content)

  return {
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt ?? '',
    cover: resolveMediaUrl(coverMedia) ?? '',
    coverAlt: resolveMediaAlt(coverMedia, doc.title),
    author:
      typeof authorRef === 'number'
        ? { name: 'Автор', role: '' }
        : {
            name: authorRef.name,
            role: authorRef.role ?? '',
            photo: resolveMediaUrl(authorRef.photo as number | Media) || undefined,
          },
    publishedAt: doc.publishedAt,
    readingTime: doc.readingTime ?? 3,
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
  options?: { coverId?: number; authorId?: number },
) {
  return {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    cover: options?.coverId,
    author: options?.authorId,
    publishedAt: article.publishedAt,
    readingTime: article.readingTime,
    sections: article.sections.map(mapArticleSectionToPayloadSection),
    status: 'published' as const,
    meta: article.seo
      ? {
          title: article.seo.title,
          description: article.seo.description,
        }
      : undefined,
  }
}
