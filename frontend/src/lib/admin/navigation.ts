import { ADMIN_BASE, adminPath } from '@/lib/admin/constants'

export type AdminNavItem = {
  href: string
  label: string
  exact?: boolean
}

export const adminNavItems: AdminNavItem[] = [
  { href: ADMIN_BASE, label: 'Обзор', exact: true },
  { href: adminPath('cases'), label: 'Кейсы' },
  { href: adminPath('services'), label: 'Услуги' },
  { href: adminPath('about'), label: 'О нас' },
  { href: adminPath('articles'), label: 'Статьи' },
  { href: adminPath('press'), label: 'Пресса' },
  { href: adminPath('media'), label: 'Медиа' },
  { href: adminPath('settings'), label: 'Настройки' },
]

export function isNavActive(pathname: string, item: AdminNavItem) {
  if (item.exact) return pathname === item.href
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}
