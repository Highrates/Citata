import { ServicesList } from '@/components/admin/ServicesList'
import { fetchAdminServices } from '@/lib/admin/data'
import { flashFromSearchParams } from '@/lib/admin/flash'

export const metadata = { title: 'Услуги' }

export default async function CmsServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const sp = await searchParams
  const { items, source } = await fetchAdminServices()

  return <ServicesList items={items} source={source} {...flashFromSearchParams(sp)} />
}
