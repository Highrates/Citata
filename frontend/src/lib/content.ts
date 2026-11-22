import { articles } from '@/content/articles'
import { cases } from '@/content/cases'
import { pressMentions } from '@/content/press'
import { siteSettings } from '@/content/site'
import type { Article, Case } from '@/content/types'

export function getSiteSettings() {
  return siteSettings
}

/** Синхронно — фикстуры (сборка без БД, generateStaticParams) */
export function getCases(): Case[] {
  return [...cases].sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getCaseBySlug(slug: string): Case | undefined {
  return cases.find((c) => c.slug === slug)
}

export function getArticles(): Article[] {
  return [...articles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
}

export function getFeaturedArticles(): Article[] {
  return getArticles().filter((a) => a.featured).slice(0, 3)
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug)
}

export function getPressMentions() {
  return pressMentions
}

export function getMainServices() {
  return siteSettings.mainServices
}

export function getExtraServices() {
  return siteSettings.extraServices
}

export function formatDateRu(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
