import 'server-only'

import { unstable_cache } from 'next/cache'
import { pressMentions } from '@/content/press'
import type { PressMention } from '@/content/types'
import { fetchAllPages } from '@/lib/admin/paginate'
import { payloadGet, type PayloadListResponse } from '@/lib/api/payload-client'
import { usesPayloadContent } from '@/lib/content-source'
import { mapPayloadPressMentionToPressMention } from '@/lib/map-press'
import type { PressMention as PayloadPressMention } from '@/payload-types'

function sortPress(items: PressMention[]) {
  return [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

export function getFixturePressMentions(): PressMention[] {
  return sortPress(pressMentions)
}

const fetchPayloadPressMentions = unstable_cache(
  async (): Promise<PressMention[]> => {
    const docs = await fetchAllPages<PayloadPressMention>((page, limit) =>
      payloadGet<PayloadListResponse<PayloadPressMention>>('/api/press-mentions', {
        depth: 0,
        limit,
        page,
        sort: 'sortOrder',
      }),
    )
    return sortPress(docs.map(mapPayloadPressMentionToPressMention))
  },
  ['payload-press-mentions'],
  { tags: ['press-mentions'], revalidate: 300 },
)

export async function fetchPressMentions(): Promise<PressMention[]> {
  if (usesPayloadContent()) return fetchPayloadPressMentions()
  return getFixturePressMentions()
}
