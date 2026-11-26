import type { Metadata } from 'next'
import { WorksPageContent } from '@/components/works/WorksPageContent'
import { fetchEvents } from '@/lib/content-events'

export const metadata: Metadata = {
  title: 'События',
  description: 'События и новости PR-агентства ЦИТАТА.',
}

export const revalidate = 300

export default async function EventsPage() {
  const items = (await fetchEvents())
    .filter((item) => item.cover)
    .map(({ slug, title, cover, coverAlt }) => ({
      slug,
      title,
      cover,
      coverAlt: coverAlt || title,
      href: `/events/${slug}`,
    }))

  return <WorksPageContent items={items} label="События" title="События" showTitle />
}