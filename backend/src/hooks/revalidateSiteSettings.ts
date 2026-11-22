import type { GlobalAfterChangeHook } from 'payload'

import { revalidateFrontend } from '@/lib/revalidate-frontend'

export const revalidateSiteSettings: GlobalAfterChangeHook = ({ doc, req: { context } }) => {
  if (context.disableRevalidate) return doc

  void revalidateFrontend({
    paths: ['/', '/about', '/contacts', '/services'],
    tags: ['site-settings', 'sitemap'],
  })

  return doc
}
