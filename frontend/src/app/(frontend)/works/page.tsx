import type { Metadata } from 'next'
import { WorksPageContent } from '@/components/works/WorksPageContent'
import { fetchCases } from '@/lib/content-cases'

export const metadata: Metadata = {
  title: 'Работы',
  description: 'Кейсы PR-агентства ЦИТАТА: стратегия, запуск, рост.',
}

export const revalidate = 300

export default async function WorksPage() {
  const items = (await fetchCases()).map(({ slug, title, cover, coverAlt, summary }) => ({
    slug,
    title,
    cover,
    coverAlt,
    summary,
    href: `/works/${slug}`,
  }))

  return <WorksPageContent items={items} label="Работы" title="Работы" />
}
