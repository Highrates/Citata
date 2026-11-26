import { articles } from '@/content/articles'
import { cases } from '@/content/cases'
import { events } from '@/content/events'
import { pressMentions } from '@/content/press'
import { siteSettings } from '@/content/site'
import type { Article, Case, Event } from '@/content/types'

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

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug)
}

export function getEvents(): Event[] {
  return [...events].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
}

export function getFeaturedEvents(): Event[] {
  return getEvents().filter((a) => a.featured).slice(0, 3)
}

export function getEventBySlug(slug: string): Event | undefined {
  return events.find((a) => a.slug === slug)
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
