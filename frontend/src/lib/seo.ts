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
    sameAs: ['https://t.me/citata_pr_bot'],
  }
}

export function articleJsonLd(input: {
  title: string
  description?: string | null
  url: string
  datePublished: string
  authorName?: string | null
  imageUrl?: string | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
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
