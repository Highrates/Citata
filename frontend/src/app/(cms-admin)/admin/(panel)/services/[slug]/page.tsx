import { notFound } from 'next/navigation'
import { ServiceEditForm } from '@/components/admin/ServiceEditForm'
import { fetchAdminServiceBySlug } from '@/lib/admin/data'
import { flashFromSearchParams } from '@/lib/admin/flash'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { item } = await fetchAdminServiceBySlug(slug)
  return { title: item ? `Услуга: ${item.title}` : 'Услуга' }
}

export default async function CmsServiceEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const { slug } = await params
  const sp = await searchParams
  const { item, source } = await fetchAdminServiceBySlug(slug)
  if (!item) notFound()

  return (
    <ServiceEditForm
      key={item.slug}
      item={item}
      source={source}
      {...flashFromSearchParams(sp)}
    />
  )
}
