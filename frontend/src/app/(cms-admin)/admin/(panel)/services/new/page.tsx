import { ServiceEditForm } from '@/components/admin/ServiceEditForm'
import { flashFromSearchParams } from '@/lib/admin/flash'
import { hasPayloadDatabase } from '@/lib/admin/payload-helpers'

export const metadata = { title: 'Новая услуга' }

export default async function CmsServiceNewPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const sp = await searchParams
  const source = hasPayloadDatabase() ? 'payload' : 'fixtures'

  return <ServiceEditForm isNew source={source} {...flashFromSearchParams(sp)} />
}
