import type { Metadata } from 'next'
import { Onest } from 'next/font/google'
import { SiteChrome } from '@/components/layout/SiteChrome'
import type { GalleryItem } from '@/content/types'
import { fetchFeaturedCases } from '@/lib/content-cases'
import { fetchSiteSettings } from '@/lib/content-site'
import './globals.css'

function buildBootGallery(
  aboutGallery: GalleryItem[],
  caseCovers: { src: string; alt: string }[],
): GalleryItem[] {
  const seen = new Set<string>()
  const out: GalleryItem[] = []
  for (const item of [...aboutGallery, ...caseCovers.map((c) => ({ ...c, kind: 'image' as const }))]) {
    if (!item.src || seen.has(item.src)) continue
    seen.add(item.src)
    out.push(item)
    if (out.length >= 12) break
  }
  return out
}

const onest = Onest({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  variable: '--font-onest',
  display: 'swap',
})

export const revalidate = 300

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://citata-pr.ru'),
  title: {
    default: 'ЦИТАТА — PR-агентство',
    template: '%s — ЦИТАТА',
  },
  description:
    'PR-агентство информационных технологий и коммуникаций. Привлекаем внимание к бизнесу, стартапу или мероприятию.',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'ЦИТАТА',
  },
  robots: { index: true, follow: true },
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [settings, featuredCases] = await Promise.all([
    fetchSiteSettings(),
    fetchFeaturedCases(),
  ])
  const bootGallery = buildBootGallery(
    settings.aboutGallery,
    featuredCases.map((item) => ({ src: item.cover, alt: item.coverAlt || item.title })),
  )

  return (
    <html lang="ru" className={`${onest.variable} is-preloading`}>
      <body>
        <SiteChrome
          telegramChannelUrl={settings.telegramChannelUrl}
          telegramBotUrl={settings.telegramBotUrl}
          infoEmail={settings.infoEmail}
          aboutGallery={bootGallery}
          legal={settings.legal}
        >
          {children}
        </SiteChrome>
      </body>
    </html>
  )
}
