'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useState } from 'react'
import { logoutAdminAction } from '@/lib/admin/actions'
import { adminNavItems, isNavActive } from '@/lib/admin/navigation'
import { AdminLocaleProvider } from '@/lib/admin-i18n/adminLocaleContext'

type AdminShellProps = {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname()
  const [navOpen, setNavOpen] = useState(false)
  const navId = useId()

  useEffect(() => {
    setNavOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!navOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNavOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navOpen])

  useEffect(() => {
    if (!navOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [navOpen])

  return (
    <AdminLocaleProvider locale="ru">
      <div className={`admin-shell${navOpen ? ' admin-shell--nav-open' : ''}`}>
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-topbar__menu"
            aria-expanded={navOpen}
            aria-controls={navId}
            onClick={() => setNavOpen((open) => !open)}
          >
            Меню
          </button>
          <p className="admin-topbar__brand">Цитата</p>
        </header>

        <div
          className="admin-nav-backdrop"
          hidden={!navOpen}
          onClick={() => setNavOpen(false)}
          aria-hidden
        />

        <aside id={navId} className="admin-sidebar" aria-label="Навигация админки">
          <p className="admin-brand">Цитата</p>
          <nav className="admin-nav" aria-label="Разделы админки">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-link${isNavActive(pathname, item) ? ' admin-nav-link--active' : ''}`}
                onClick={() => setNavOpen(false)}
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
    </AdminLocaleProvider>
  )
}
