import { AboutForm } from '@/components/admin/AboutForm'
import { fetchAdminSettings } from '@/lib/admin/data'
import { flashFromSearchParams } from '@/lib/admin/flash'

export const metadata = { title: 'О нас' }

export default async function CmsAboutPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const sp = await searchParams
  const { settings, source } = await fetchAdminSettings()

  return <AboutForm settings={settings} source={source} {...flashFromSearchParams(sp)} />
}
