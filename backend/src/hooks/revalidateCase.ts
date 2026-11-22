import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateFrontend } from '@/lib/revalidate-frontend'

export const revalidateCase: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc

  const paths = new Set<string>(['/works', '/'])
  const tags = ['cases', 'sitemap']

  if (doc.slug) paths.add(`/works/${doc.slug}`)

  if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
    paths.add(`/works/${previousDoc.slug}`)
  }

  if (doc.status === 'published' || previousDoc?.status === 'published') {
    payload.logger.info(`Revalidating case paths: ${[...paths].join(', ')}`)
    void revalidateFrontend({ paths: [...paths], tags })
  }

  return doc
}

export const revalidateCaseDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (context.disableRevalidate) return doc

  if (doc?.slug) {
    void revalidateFrontend({
      paths: [`/works/${doc.slug}`, '/works', '/'],
      tags: ['cases', 'sitemap'],
    })
  }

  return doc
}
