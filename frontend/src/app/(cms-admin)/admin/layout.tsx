import type { Metadata } from 'next'
import { Onest } from 'next/font/google'
import '@/styles/admin.css'

const onest = Onest({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  variable: '--font-onest',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Админка — ЦИТАТА',
    template: '%s — Админка ЦИТАТА',
  },
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={onest.variable}>
      <body className="admin-body">{children}</body>
    </html>
  )
}
