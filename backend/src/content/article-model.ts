/**
 * Каноническая модель статьи — единый контракт для фикстур, Payload CMS и фронта.
 */
import type { Article, ArticleSection } from './types'

export const ARTICLE_SECTION_TYPES = ['paragraph', 'heading', 'quote', 'list'] as const

export type ArticleSectionType = (typeof ARTICLE_SECTION_TYPES)[number]

export const PAYLOAD_SECTION_SLUG_TO_TYPE: Record<string, ArticleSectionType> = {
  paragraph: 'paragraph',
  heading: 'heading',
  quote: 'quote',
  list: 'list',
}

export function isArticleSection(value: unknown): value is ArticleSection {
  if (!value || typeof value !== 'object' || !('type' in value)) return false
  return ARTICLE_SECTION_TYPES.includes((value as ArticleSection).type as ArticleSectionType)
}

export function validateArticle(article: Article): string[] {
  const errors: string[] = []
  if (!article.slug?.trim()) errors.push('slug обязателен')
  if (!article.title?.trim()) errors.push('title обязателен')
  if (!article.cover?.trim()) errors.push('cover обязателен')
  if (!article.author?.name?.trim()) errors.push('author.name обязателен')
  if (!Array.isArray(article.sections)) errors.push('sections должен быть массивом')
  return errors
}
