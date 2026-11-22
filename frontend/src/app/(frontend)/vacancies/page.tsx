import type { Metadata } from 'next'
import { FadeIn } from '@/components/animations/FadeIn'
import { fetchSiteSettings } from '@/lib/content-site'

export const metadata: Metadata = {
  title: 'Вакансии',
  description: 'Вакансии PR-агентства ЦИТАТА.',
}

export const revalidate = 300

export default async function VacanciesPage() {
  const settings = await fetchSiteSettings()

  return (
    <section className="section container">
      <FadeIn>
        <h1 className="page-title">Вакансии</h1>
        <p className="case-content__paragraph" style={{ maxWidth: 720 }}>
          Мы всегда открыты к знакомству с талантливыми PR-специалистами, редакторами и менеджерами
          проектов. Напишите нам — расскажите о себе и своём опыте.
        </p>
        <a
          href={`mailto:${settings.infoEmail}?subject=Вакансия%20в%20ЦИТАТА`}
          className="contacts-cta"
          style={{ marginTop: 24, display: 'inline-block' }}
        >
          Откликнуться →
        </a>
      </FadeIn>
    </section>
  )
}
