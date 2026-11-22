import { CasesList } from '@/components/admin/CasesList'
import { fetchAdminCases } from '@/lib/admin/data'
import { flashFromSearchParams } from '@/lib/admin/flash'

export const metadata = { title: 'Кейсы' }

export default async function CmsCasesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const sp = await searchParams
  const { items, source } = await fetchAdminCases()
  const flash = flashFromSearchParams(sp)

  return <CasesList items={items} source={source} {...flash} />
}
