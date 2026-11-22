import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://citata-pr.ru'
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/payload/', '/api/'],
    },
    sitemap: `${siteUrl.replace(/\/$/, '')}/sitemap.xml`,
  }
}
