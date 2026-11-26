const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://citata-pr.ru'

export function absoluteUrl(path: string) {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${siteUrl.replace(/\/$/, '')}${normalized}`
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ЦИТАТА',
    url: siteUrl,
    description: 'PR-агентство информационных технологий и коммуникаций',
    sameAs: ['https://t.me/kate_kolesnik'],
  }
}

type EditorialJsonLdInput = {
  title: string
  description?: string | null
  url: string
  datePublished: string
  authorName?: string | null
  imageUrl?: string | null
}

function editorialJsonLd(type: 'Article' | 'NewsArticle', input: EditorialJsonLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    headline: input.title,
    description: input.description || undefined,
    datePublished: input.datePublished,
    author: input.authorName
      ? {
          '@type': 'Person',
          name: input.authorName,
        }
      : undefined,
    image: input.imageUrl || undefined,
    mainEntityOfPage: input.url,
    publisher: {
      '@type': 'Organization',
      name: 'ЦИТАТА',
      url: siteUrl,
    },
  }
}

export function articleJsonLd(input: EditorialJsonLdInput) {
  return editorialJsonLd('Article', input)
}

/**
 * Editorial «События» (бывш. новости) — NewsArticle, not schema.org Event
 * (no startDate / location / tickets).
 */
export function newsArticleJsonLd(input: EditorialJsonLdInput) {
  return editorialJsonLd('NewsArticle', input)
}

/** Case study / portfolio piece — CreativeWork (no dedicated CaseStudy type). */
export function creativeWorkJsonLd(input: {
  title: string
  description?: string | null
  url: string
  imageUrl?: string | null
  datePublished?: string | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: input.title,
    headline: input.title,
    description: input.description || undefined,
    url: input.url,
    image: input.imageUrl || undefined,
    datePublished: input.datePublished || undefined,
    publisher: {
      '@type': 'Organization',
      name: 'ЦИТАТА',
      url: siteUrl,
    },
  }
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
