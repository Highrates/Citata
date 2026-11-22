import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateFrontend } from '@/lib/revalidate-frontend'

function bump() {
  void revalidateFrontend({
    paths: ['/services'],
    tags: ['services', 'sitemap'],
  })
}

export const revalidateService: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) bump()
  return doc
}

export const revalidateServiceDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) bump()
  return doc
}
