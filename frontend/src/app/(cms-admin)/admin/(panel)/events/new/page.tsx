import { EventEditForm } from '@/components/admin/EventEditForm'
import { fetchAdminCases } from '@/lib/admin/data'
import { flashFromSearchParams } from '@/lib/admin/flash'
import { hasPayloadDatabase } from '@/lib/admin/payload-helpers'

export const metadata = { title: 'Новое событие' }

export default async function CmsEventNewPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const sp = await searchParams
  const source = hasPayloadDatabase() ? 'payload' : 'fixtures'
  const { items: cases } = await fetchAdminCases()
  const casesOptions = cases.map((c) => ({ slug: c.slug, title: c.title }))

  return (
    <EventEditForm
      isNew
      source={source}
      casesOptions={casesOptions}
      previewToken={null}
      {...flashFromSearchParams(sp)}
    />
  )
}