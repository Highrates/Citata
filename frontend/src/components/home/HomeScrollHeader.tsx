'use client'

import { SiteBar } from '@/components/layout/SiteBar'

/** Compact header that appears after the hero block scrolls away. */
export function HomeScrollHeader() {
  return <SiteBar mode="reveal" />
}
