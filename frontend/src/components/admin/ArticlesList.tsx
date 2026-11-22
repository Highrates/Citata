'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { AdminBadge } from '@/components/admin/AdminBadge'
import { AdminEditLink } from '@/components/admin/AdminEditLink'
import { AdminFlash, AdminSourceBanner } from '@/components/admin/AdminFlash'
import { AdminSearch } from '@/components/admin/AdminSearch'
import { formatDateRu } from '@/lib/content'
import type { Article, ArticleStatus } from '@/content/types'
import type { AdminDataSource } from '@/lib/admin/data'

type ArticlesListProps = {
  items: Article[]
  source: AdminDataSource
  saved?: boolean
  error?: string
}

type ArticleFilter = 'all' | 'published' | 'featured' | 'draft'

function statusLabel(status: ArticleStatus | undefined) {
  if (status === 'published') return 'Опубликовано'
  return 'Черновик'
}

function statusVariant(status: ArticleStatus | undefined): 'on' | 'draft' {
  if (status === 'published') return 'on'
  return 'draft'
}

export function ArticlesList({ items, source, saved, error }: ArticlesListProps) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<ArticleFilter>('all')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return items.filter((item) => {
      const status = item.status ?? 'draft'
      if (filter === 'published' && status !== 'published') return false
      if (filter === 'draft' && status !== 'draft') return false
      if (filter === 'featured' && !(item.featured && status === 'published')) return false
      if (!q) return true
      return (
        item.title.toLowerCase().includes(q) ||
        item.author.name.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q)
      )
    })
  }, [items, query, filter])

  return (
    <>
      <div className="admin-page-head">
        <h1 className="admin-title">Статьи</h1>
        <Link href="/admin/articles/new" className="admin-btn admin-btn--accent">
          Добавить статью
        </Link>
      </div>

      <AdminSourceBanner source={source} />
      <AdminFlash saved={saved} error={error} />

      <div className="admin-toolbar">
        <AdminSearch
          className="admin-search--toolbar"
          value={query}
          onChange={setQuery}
          placeholder="Поиск…"
        />
      </div>

      <div className="admin-tabs-pill" role="tablist" aria-label="Фильтр">
        {(
          [
            ['all', 'Все'],
            ['published', 'Опубликованные'],
            ['featured', 'На главной'],
            ['draft', 'Черновики'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={filter === value}
            className={`admin-tab-pill${filter === value ? ' admin-tab-pill--active' : ''}`}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="admin-table-col-thumb" />
              <th>Заголовок</th>
              <th>Статус</th>
              <th className="admin-table-col-home">Главная</th>
              <th>Автор</th>
              <th>Дата</th>
              <th className="admin-table-actions" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const status = item.status ?? 'draft'
              const inactive = status !== 'published'
              return (
                <tr key={item.slug} className={inactive ? 'admin-table-row--inactive' : undefined}>
                  <td>
                    {item.cover ? (
                      <Image
                        src={item.cover}
                        alt=""
                        width={46}
                        height={46}
                        className="admin-table-thumb"
                      />
                    ) : (
                      <span className="admin-table-thumb admin-table-thumb--empty" />
                    )}
                  </td>
                  <td>
                    <Link href={`/admin/articles/${item.slug}`} className="admin-table-title">
                      {item.title}
                    </Link>
                    <div className="admin-table-meta">
                      {item.readingTime} мин
                      {item.excerpt
                        ? ` · ${item.excerpt.length > 64 ? `${item.excerpt.slice(0, 64)}…` : item.excerpt}`
                        : ''}
                    </div>
                  </td>
                  <td>
                    <AdminBadge variant={statusVariant(status)}>{statusLabel(status)}</AdminBadge>
                  </td>
                  <td className="admin-table-col-home">
                    {item.featured && status === 'published' ? (
                      <span className="admin-home-dot" title="На главной" aria-label="На главной">
                        ●
                      </span>
                    ) : (
                      <span className="admin-home-dot admin-home-dot--off" aria-hidden>
                        ○
                      </span>
                    )}
                  </td>
                  <td>{item.author.name}</td>
                  <td>{formatDateRu(item.publishedAt)}</td>
                  <td className="admin-table-actions">
                    <AdminEditLink
                      href={`/admin/articles/${item.slug}`}
                      label={`Изменить «${item.title}»`}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
