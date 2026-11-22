import { notFound } from 'next/navigation'
import { ArticleEditForm } from '@/components/admin/ArticleEditForm'
import { fetchAdminArticleBySlug } from '@/lib/admin/data'
import { flashFromSearchParams } from '@/lib/admin/flash'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { item } = await fetchAdminArticleBySlug(slug)
  return { title: item ? `Статья: ${item.title}` : 'Статья' }
}

export default async function CmsArticleEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const { slug } = await params
  const sp = await searchParams
  const { item, source } = await fetchAdminArticleBySlug(slug)
  if (!item) notFound()

  return (
    <ArticleEditForm
      key={item.slug}
      item={item}
      source={source}
      {...flashFromSearchParams(sp)}
    />
  )
}
