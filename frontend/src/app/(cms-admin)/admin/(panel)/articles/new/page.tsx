import { ArticleEditForm } from '@/components/admin/ArticleEditForm'
import { flashFromSearchParams } from '@/lib/admin/flash'
import { hasPayloadDatabase } from '@/lib/admin/payload-helpers'

export const metadata = { title: 'Новая статья' }

export default async function CmsArticleNewPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const sp = await searchParams
  const source = hasPayloadDatabase() ? 'payload' : 'fixtures'

  return <ArticleEditForm isNew source={source} {...flashFromSearchParams(sp)} />
}
