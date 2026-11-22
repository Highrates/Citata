'use client'

import { usePathname } from 'next/navigation'
import { Footer } from '@/components/layout/Footer'
import { SiteBar } from '@/components/layout/SiteBar'
import { SitePreloader } from '@/components/layout/SitePreloader'
import type { SiteSettings } from '@/content/types'

type SiteChromeProps = {
  children: React.ReactNode
  telegramChannelUrl: string
  telegramBotUrl: string
  legal: SiteSettings['legal']
}

export function SiteChrome({
  children,
  telegramChannelUrl,
  telegramBotUrl,
  legal,
}: SiteChromeProps) {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const isAbout = pathname === '/about'
  const isServices = pathname === '/services'
  const hideHeader = isHome || isAbout

  return (
    <>
      <SitePreloader telegramUrl={telegramChannelUrl} />
      {!hideHeader ? <SiteBar mode="always" /> : null}
      <main className={hideHeader ? undefined : 'page-with-bar'}>{children}</main>
      {!isServices && !isAbout ? (
        <Footer
          telegramChannelUrl={telegramChannelUrl}
          telegramBotUrl={telegramBotUrl}
          legal={legal}
        />
      ) : null}
    </>
  )
}
