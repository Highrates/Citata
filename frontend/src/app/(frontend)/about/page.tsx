import type { Metadata } from 'next'
import { AboutPageContent } from '@/components/about/AboutPageContent'
import { fetchSiteSettings } from '@/lib/content-site'

export const metadata: Metadata = {
  title: 'О нас',
  description: 'PR-агентство ЦИТАТА: стратегия, идея, запуск и рост для брендов и экспертов.',
}

export const revalidate = 300

const FALLBACK_PORTRAIT = {
  src: '/images/about/portrait.jpg',
  alt: 'ЦИТАТА — PR-агентство',
  kind: 'image' as const,
}

export default async function AboutPage() {
  const settings = await fetchSiteSettings()
  const gallery = settings.aboutGallery?.length ? settings.aboutGallery : [FALLBACK_PORTRAIT]

  return (
    <AboutPageContent
      aboutText={settings.aboutText}
      infoEmail={settings.infoEmail}
      telegramChannelUrl={settings.telegramChannelUrl}
      aboutStats={settings.aboutStats}
      images={gallery}
    />
  )
}
