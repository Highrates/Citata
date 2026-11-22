import type { PressMention } from '@/content/types'
import type { PressMention as PayloadPressMention } from '@/payload-types'

export function mapPayloadPressMentionToPressMention(doc: PayloadPressMention): PressMention {
  return {
    id: doc.id,
    title: doc.title,
    source: doc.source,
    url: doc.url,
    sortOrder: doc.sortOrder ?? 0,
  }
}

export function mapPressMentionToPayloadData(item: PressMention) {
  return {
    title: item.title,
    source: item.source,
    url: item.url,
    sortOrder: item.sortOrder ?? 0,
  }
}
