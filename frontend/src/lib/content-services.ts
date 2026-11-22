import 'server-only'

import { unstable_cache } from 'next/cache'
import { allFixtureServices, servicesHeroImage } from '@/content/services'
import type { Service } from '@/content/types'
import { payloadGet, type PayloadListResponse } from '@/lib/api/payload-client'
import { usesPayloadContent } from '@/lib/content-source'
import { mapPayloadServiceToService } from '@/lib/map-service'
import type { Service as PayloadService } from '@/payload-types'

function sortServices(items: Service[]) {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, 'ru'))
}

export function getFixtureServices(): Service[] {
  return sortServices(allFixtureServices)
}

const fetchPayloadServices = unstable_cache(
  async (): Promise<Service[]> => {
    const result = await payloadGet<PayloadListResponse<PayloadService>>('/api/services', {
      depth: 1,
      limit: 200,
      sort: 'sortOrder',
    })
    return sortServices(result.docs.map(mapPayloadServiceToService))
  },
  ['payload-services'],
  { tags: ['services'], revalidate: 300 },
)

export async function fetchServices(): Promise<Service[]> {
  if (usesPayloadContent()) {
    try {
      const items = await fetchPayloadServices()
      if (items.length) return items
    } catch {
      // fall through to fixtures
    }
  }
  return getFixtureServices()
}

export { servicesHeroImage }
