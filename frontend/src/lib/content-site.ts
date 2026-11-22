import 'server-only'

import { unstable_cache } from 'next/cache'
import { siteSettings as fixtureSiteSettings } from '@/content/site'
import type { SiteSettings } from '@/content/types'
import { payloadGet } from '@/lib/api/payload-client'
import { usesPayloadContent } from '@/lib/content-source'
import { mapPayloadSiteSettingsToSiteSettings } from '@/lib/map-site'
import type { SiteSetting } from '@/payload-types'

const fetchPayloadSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const doc = await payloadGet<SiteSetting>('/api/globals/site-settings', { depth: 2 })
    return mapPayloadSiteSettingsToSiteSettings(doc)
  },
  ['payload-site-settings'],
  { tags: ['site-settings'], revalidate: 300 },
)

export function getFixtureSiteSettings(): SiteSettings {
  return fixtureSiteSettings
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  if (usesPayloadContent()) {
    try {
      return await fetchPayloadSiteSettings()
    } catch {
      // fall through to fixtures
    }
  }
  return getFixtureSiteSettings()
}
