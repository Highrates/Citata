import type { AdminDataSource } from '@/lib/admin/data'

type AdminFlashProps = {
  saved?: boolean
  error?: string
}

export function AdminFlash({ saved, error }: AdminFlashProps) {
  if (saved) return <p className="admin-success">Сохранено</p>
  if (error) return <p className="admin-error">{error}</p>
  return null
}

type AdminSourceBannerProps = {
  source: AdminDataSource
}

export function AdminSourceBanner({ source }: AdminSourceBannerProps) {
  if (source === 'payload') return null
  return (
    <p className="admin-error">
      Показаны фикстуры. Настройте DATABASE_URL и выполните seed, чтобы сохранять в Payload.
    </p>
  )
}
