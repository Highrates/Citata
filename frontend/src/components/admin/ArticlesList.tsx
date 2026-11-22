'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { AdminBadge } from '@/components/admin/AdminBadge'
import { AdminEditLink } from '@/components/admin/AdminEditLink'
import { AdminFlash, AdminSourceBanner } from '@/components/admin/AdminFlash'
import { AdminSearch } from '@/components/admin/AdminSearch'
import { formatDateRu } from '@/lib/content'
import type { Article } from '@/content/types'
import type { AdminDataSource } from '@/lib/admin/data'

type ArticlesListProps = {
  items: Article[]
  source: AdminDataSource
  saved?: boolean
  error?: string
}

export function ArticlesList({ items, source, saved, error }: ArticlesListProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query) return items
    const q = query.toLowerCase()
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.author.name.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q),
    )
  }, [items, query])

  return (
    <>
      <h1 className="admin-title">Статьи</h1>
      <p className="admin-lead">Блог PR-агентства.</p>

      <AdminSourceBanner source={source} />
      <AdminFlash saved={saved} error={error} />

      <div className="admin-toolbar">
        <AdminSearch
          className="admin-search--toolbar"
          value={query}
          onChange={setQuery}
          placeholder="Поиск…"
        />
        <Link href="/admin/articles/new" className="admin-btn admin-btn--accent admin-toolbar__end">
          Добавить статью
        </Link>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="admin-table-col-thumb" />
              <th>Заголовок</th>
              <th>Автор</th>
              <th>Дата</th>
              <th className="admin-table-actions" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.slug}>
                <td>
                  <Image
                    src={item.cover}
                    alt=""
                    width={46}
                    height={46}
                    className="admin-table-thumb"
                  />
                </td>
                <td>
                  <Link href={`/admin/articles/${item.slug}`}>{item.title}</Link>
                  <div className="admin-table-meta">
                    {item.readingTime} мин{item.featured ? ' · на главной' : ''}
                  </div>
                </td>
                <td>{item.author.name}</td>
                <td>{formatDateRu(item.publishedAt)}</td>
                <td className="admin-table-actions">
                  <AdminBadge variant={item.featured ? 'on' : 'off'}>
                    {item.featured ? 'Featured' : '—'}
                  </AdminBadge>
                  <AdminEditLink
                    href={`/admin/articles/${item.slug}`}
                    label={`Изменить «${item.title}»`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
