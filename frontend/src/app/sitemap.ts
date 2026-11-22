import type { MetadataRoute } from 'next'
import { fetchArticles } from '@/lib/content-articles'
import { fetchCases } from '@/lib/content-cases'
import { absoluteUrl } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ['/', '/works', '/articles', '/services', '/about', '/contacts', '/vacancies', '/privacy', '/terms'].map(
    (path) => ({
      url: absoluteUrl(path),
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '/' ? 1 : 0.8,
    }),
  )

  const casePages = (await fetchCases()).map((item) => ({
    url: absoluteUrl(`/works/${item.slug}`),
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const articlePages = (await fetchArticles()).map((item) => ({
    url: absoluteUrl(`/articles/${item.slug}`),
    lastModified: new Date(item.publishedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...casePages, ...articlePages]
}
