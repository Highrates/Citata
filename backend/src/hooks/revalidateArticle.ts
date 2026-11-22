import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateFrontend } from '@/lib/revalidate-frontend'

export const revalidateArticle: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc

  if (doc.status === 'published') {
    payload.logger.info(`Revalidating article: /articles/${doc.slug}`)
    void revalidateFrontend({
      paths: [`/articles/${doc.slug}`, '/articles', '/'],
      tags: ['articles', 'sitemap'],
    })
  }

  if (previousDoc?.status === 'published' && doc.status !== 'published') {
    void revalidateFrontend({
      paths: [`/articles/${previousDoc.slug}`, '/articles', '/'],
      tags: ['articles', 'sitemap'],
    })
  }

  return doc
}

export const revalidateArticleDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (context.disableRevalidate) return doc

  if (doc?.slug) {
    void revalidateFrontend({
      paths: [`/articles/${doc.slug}`, '/articles', '/'],
      tags: ['articles', 'sitemap'],
    })
  }

  return doc
}
