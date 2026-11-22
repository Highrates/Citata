import type { Metadata } from 'next'
import { Onest } from 'next/font/google'
import { SiteChrome } from '@/components/layout/SiteChrome'
import { fetchSiteSettings } from '@/lib/content-site'
import './globals.css'

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
  const settings = await fetchSiteSettings()

  return (
    <html lang="ru" className={`${onest.variable} is-preloading`}>
      <body>
        <SiteChrome
          telegramChannelUrl={settings.telegramChannelUrl}
          telegramBotUrl={settings.telegramBotUrl}
          legal={settings.legal}
        >
          {children}
        </SiteChrome>
      </body>
    </html>
  )
}
