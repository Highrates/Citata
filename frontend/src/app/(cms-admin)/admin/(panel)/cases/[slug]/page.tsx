import { notFound } from 'next/navigation'
import { CaseEditForm } from '@/components/admin/CaseEditForm'
import { fetchAdminCaseBySlug, fetchAdminEvents } from '@/lib/admin/data'
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
  const [{ item, source }, { items: events }] = await Promise.all([
    fetchAdminCaseBySlug(slug),
    fetchAdminEvents(),
  ])
  if (!item) notFound()

  const relatedEvents = events
    .filter((e) => e.cases?.some((c) => c.slug === item.slug))
    .map((e) => ({ slug: e.slug, title: e.title }))

  return (
    <CaseEditForm
      key={item.slug}
      item={item}
      source={source}
      relatedEvents={relatedEvents}
      previewToken={await createCasePreviewToken(item.slug)}
      {...flashFromSearchParams(sp)}
    />
  )
}
