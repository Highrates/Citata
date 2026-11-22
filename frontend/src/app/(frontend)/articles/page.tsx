import type { Metadata } from 'next'
import { WorksPageContent } from '@/components/works/WorksPageContent'
import { fetchArticles } from '@/lib/content-articles'

export const metadata: Metadata = {
  title: 'Новости',
  description: 'Статьи PR-агентства ЦИТАТА о стратегии, коммуникациях и медиа.',
}

export const revalidate = 300

export default async function ArticlesPage() {
  const items = (await fetchArticles())
    .filter((item) => item.cover)
    .map(({ slug, title, cover, coverAlt }) => ({
      slug,
      title,
      cover,
      coverAlt: coverAlt || title,
      href: `/articles/${slug}`,
    }))

  return <WorksPageContent items={items} label="Новости" title="Новости" showTitle />
}
