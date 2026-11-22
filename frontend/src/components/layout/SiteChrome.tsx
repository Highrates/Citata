'use client'

import { usePathname } from 'next/navigation'
import { Footer } from '@/components/layout/Footer'
import { SiteBar } from '@/components/layout/SiteBar'
import { SitePreloader } from '@/components/layout/SitePreloader'
import type { GalleryItem, SiteSettings } from '@/content/types'

type SiteChromeProps = {
  children: React.ReactNode
  telegramChannelUrl: string
  telegramBotUrl: string
  infoEmail?: string
  aboutGallery?: GalleryItem[]
  legal: SiteSettings['legal']
}

export function SiteChrome({
  children,
  telegramChannelUrl,
  telegramBotUrl,
  infoEmail,
  aboutGallery,
  legal,
}: SiteChromeProps) {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const isAbout = pathname === '/about'
  const isServices = pathname === '/services'
  const hideHeader = isHome

  return (
    <>
      <SitePreloader
        telegramUrl={telegramChannelUrl}
        email={infoEmail}
        images={aboutGallery}
      />
      {isAbout ? (
        <SiteBar
          mode="reveal"
          revealTarget=".about-split__media"
          revealOnMobile
          email={infoEmail}
          telegramUrl={telegramChannelUrl}
        />
      ) : !hideHeader ? (
        <SiteBar mode="always" email={infoEmail} telegramUrl={telegramChannelUrl} />
      ) : null}
      <main className={hideHeader || isAbout ? undefined : 'page-with-bar'}>{children}</main>
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
