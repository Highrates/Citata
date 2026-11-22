import type { Metadata } from 'next'
import { HomeCasesGrid } from '@/components/home/HomeCasesGrid'
import { fetchCases } from '@/lib/content-cases'

export const metadata: Metadata = {
  title: 'Работы',
  description: 'Кейсы PR-агентства ЦИТАТА: стратегия, запуск, рост.',
}

export const revalidate = 300

export default async function WorksPage() {
  const cases = (await fetchCases()).map(({ slug, title, cover, coverAlt, year, summary }) => ({
    slug,
    title,
    cover,
    coverAlt,
    year,
    summary,
  }))

  return (
    <section className="works-page" aria-label="Работы">
      <h1 className="sr-only">Работы</h1>
      <div className="home-hero__cards">
        <HomeCasesGrid cases={cases} />
      </div>
    </section>
  )
}
