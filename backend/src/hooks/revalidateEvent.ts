import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { resolveEventCasePaths } from '@/hooks/eventCasePaths'
import { revalidateFrontend } from '@/lib/revalidate-frontend'

export const revalidateEvent: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc

  const casePaths = [
    ...(await resolveEventCasePaths(payload, doc.cases)),
    ...(await resolveEventCasePaths(payload, previousDoc?.cases)),
  ]
  const uniqueCasePaths = [...new Set(casePaths)]

  if (doc.status === 'published') {
    payload.logger.info(`Revalidating event: /events/${doc.slug}`)
    void revalidateFrontend({
      paths: [`/events/${doc.slug}`, '/events', '/', ...uniqueCasePaths],
      tags: ['events', 'cases', 'sitemap'],
    })
  }

  if (previousDoc?.status === 'published' && doc.status !== 'published') {
    void revalidateFrontend({
      paths: [`/events/${previousDoc.slug}`, '/events', '/', ...uniqueCasePaths],
      tags: ['events', 'cases', 'sitemap'],
    })
  }

  return doc
}

export const revalidateEventDelete: CollectionAfterDeleteHook = async ({
  doc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc

  if (!doc?.slug) return doc

  const casePaths = await resolveEventCasePaths(payload, doc.cases)

  void revalidateFrontend({
    paths: [`/events/${doc.slug}`, '/events', '/', ...casePaths],
    tags: ['events', 'cases', 'sitemap'],
  })

  return doc
}
