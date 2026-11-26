import { EventsList } from '@/components/admin/EventsList'
import { fetchAdminEvents } from '@/lib/admin/data'
import { flashFromSearchParams } from '@/lib/admin/flash'

export const metadata = { title: 'События' }

export default async function CmsEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const sp = await searchParams
  const { items, source } = await fetchAdminEvents()
  const flash = flashFromSearchParams(sp)

  return <EventsList items={items} source={source} {...flash} />
}