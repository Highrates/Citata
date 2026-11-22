import { PressPageClient } from '@/components/admin/PressPageClient'
import { fetchAdminPress } from '@/lib/admin/data'
import { flashFromSearchParams } from '@/lib/admin/flash'

export const metadata = { title: 'Пресса' }

export default async function CmsPressPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const sp = await searchParams
  const { items, source } = await fetchAdminPress()

  return <PressPageClient items={items} source={source} {...flashFromSearchParams(sp)} />
}
