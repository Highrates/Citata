import { SettingsForm } from '@/components/admin/SettingsForm'
import { fetchAdminSettings } from '@/lib/admin/data'
import { flashFromSearchParams } from '@/lib/admin/flash'

export const metadata = { title: 'Настройки' }

export default async function CmsSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const sp = await searchParams
  const { settings, source } = await fetchAdminSettings()

  return <SettingsForm settings={settings} source={source} {...flashFromSearchParams(sp)} />
}
