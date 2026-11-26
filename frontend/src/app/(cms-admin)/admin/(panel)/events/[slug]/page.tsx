import { notFound } from 'next/navigation'
import { EventEditForm } from '@/components/admin/EventEditForm'
import { fetchAdminCases, fetchAdminEventBySlug } from '@/lib/admin/data'
import { flashFromSearchParams } from '@/lib/admin/flash'
import { createEventPreviewToken } from '@/lib/preview'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { item } = await fetchAdminEventBySlug(slug)
  return { title: item ? `Событие: ${item.title}` : 'Событие' }
}

export default async function CmsEventEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const { slug } = await params
  const sp = await searchParams
  const [{ item, source }, { items: cases }] = await Promise.all([
    fetchAdminEventBySlug(slug),
    fetchAdminCases(),
  ])
  if (!item) notFound()

  const casesOptions = cases.map((c: { slug: string; title: string }) => ({
    slug: c.slug,
    title: c.title,
  }))

  return (
    <EventEditForm
      key={item.slug}
      item={item}
      source={source}
      casesOptions={casesOptions}
      previewToken={await createEventPreviewToken(item.slug)}
      {...flashFromSearchParams(sp)}
    />
  )
}