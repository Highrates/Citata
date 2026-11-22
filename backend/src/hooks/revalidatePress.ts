import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateFrontend } from '@/lib/revalidate-frontend'

function bump() {
  void revalidateFrontend({
    paths: ['/articles'],
    tags: ['press', 'sitemap'],
  })
}

export const revalidatePressMention: CollectionAfterChangeHook = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) bump()
  return doc
}

export const revalidatePressMentionDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) bump()
  return doc
}
