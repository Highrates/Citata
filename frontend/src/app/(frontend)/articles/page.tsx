import type { Metadata } from 'next'
import Link from 'next/link'
import { WorksPageContent } from '@/components/works/WorksPageContent'
import { fetchArticles } from '@/lib/content-articles'

export const metadata: Metadata = {
  title: 'Статьи',
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

  if (items.length === 0) {
    return (
      <section className="works-page" aria-label="Статьи">
        <h1 className="works-page__title">Статьи</h1>
        <p className="works-page__empty">
          Пока нет опубликованных статей. Новости и материалы — в{' '}
          <Link href="/events">событиях</Link>.
        </p>
      </section>
    )
  }

  return <WorksPageContent items={items} label="Статьи" title="Статьи" showTitle />
}
