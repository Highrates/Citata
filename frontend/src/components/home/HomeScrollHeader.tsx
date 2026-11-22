'use client'

import { SiteBar } from '@/components/layout/SiteBar'

type HomeScrollHeaderProps = {
  email?: string
  telegramUrl?: string
}

/** Compact header: always on mobile; after hero scroll on desktop. */
export function HomeScrollHeader({ email, telegramUrl }: HomeScrollHeaderProps) {
  return <SiteBar mode="reveal" email={email} telegramUrl={telegramUrl} />
}
