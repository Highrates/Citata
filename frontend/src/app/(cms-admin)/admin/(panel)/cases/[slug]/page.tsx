import { notFound } from 'next/navigation'
import { CaseEditForm } from '@/components/admin/CaseEditForm'
import { fetchAdminCaseBySlug } from '@/lib/admin/data'
import { flashFromSearchParams } from '@/lib/admin/flash'
import { createCasePreviewToken } from '@/lib/preview'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { item } = await fetchAdminCaseBySlug(slug)
  return { title: item ? `Кейс: ${item.title}` : 'Кейс' }
}

export default async function CmsCaseEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const { slug } = await params
  const sp = await searchParams
  const { item, source } = await fetchAdminCaseBySlug(slug)
  if (!item) notFound()

  return (
    <CaseEditForm
      key={item.slug}
      item={item}
      source={source}
      previewToken={await createCasePreviewToken(item.slug)}
      {...flashFromSearchParams(sp)}
    />
  )
}
