'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAdminAction } from '@/lib/admin/actions'
import { adminNavItems, isNavActive } from '@/lib/admin/navigation'

type AdminShellProps = {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname()

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <p className="admin-brand">Цитата</p>
        <nav className="admin-nav" aria-label="Разделы админки">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-link${isNavActive(pathname, item) ? ' admin-nav-link--active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="admin-nav-footer">
          <Link href="/" className="admin-nav-link admin-nav-link--small">
            ← На сайт
          </Link>
          <form action={logoutAdminAction}>
            <button type="submit" className="admin-nav-link admin-nav-button">
              Выйти
            </button>
          </form>
        </div>
      </aside>
      <main className="admin-content">{children}</main>
    </div>
  )
}
