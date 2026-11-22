import { ArticlesList } from '@/components/admin/ArticlesList'
import { fetchAdminArticles } from '@/lib/admin/data'
import { flashFromSearchParams } from '@/lib/admin/flash'

export const metadata = { title: 'Статьи' }

export default async function CmsArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const sp = await searchParams
  const { items, source } = await fetchAdminArticles()
  const flash = flashFromSearchParams(sp)

  return <ArticlesList items={items} source={source} {...flash} />
}
