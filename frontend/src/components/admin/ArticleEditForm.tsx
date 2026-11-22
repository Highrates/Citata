'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { AdminFlash, AdminSourceBanner } from '@/components/admin/AdminFlash'
import { AdminModal } from '@/components/admin/AdminModal'
import { formatDateRu } from '@/lib/content'
import type { Article } from '@/content/types'
import type { AdminDataSource } from '@/lib/admin/data'
import { deleteArticleAction, saveArticleAction } from '@/lib/admin/content-actions'

type ArticleEditFormProps = {
  item?: Article
  isNew?: boolean
  source: AdminDataSource
  saved?: boolean
  error?: string
}

export function ArticleEditForm({ item, isNew, source, saved, error }: ArticleEditFormProps) {
  const pathname = usePathname()
  const [showDelete, setShowDelete] = useState(false)

  const sectionsDefault = item?.sections?.length ? JSON.stringify(item.sections, null, 2) : '[]'

  return (
    <>
      <div className="admin-back-link">
        <Link href="/admin/articles" className="admin-muted">
          ← Статьи
        </Link>
      </div>
      <h1 className="admin-title">{isNew ? 'Новая статья' : item?.title}</h1>
      <p className="admin-lead">
        {isNew ? 'Создание статьи в Payload' : `Опубликовано ${item ? formatDateRu(item.publishedAt) : ''}`}
      </p>

      <AdminSourceBanner source={source} />
      <AdminFlash saved={saved} error={error} />

      <form className="admin-form admin-form--wide" action={saveArticleAction}>
        <input type="hidden" name="returnPath" value={pathname} />
        {!isNew && item ? <input type="hidden" name="originalSlug" value={item.slug} /> : null}

        <div className="admin-field">
          <label className="admin-field-label" htmlFor="title">
            Заголовок
          </label>
          <input
            className="admin-control admin-control--input"
            id="title"
            name="title"
            defaultValue={item?.title ?? ''}
            required
          />
        </div>

        <div className="admin-field">
          <label className="admin-field-label" htmlFor="slug">
            Slug
          </label>
          <input
            className="admin-control admin-control--input"
            id="slug"
            name="slug"
            defaultValue={item?.slug ?? ''}
            required
          />
        </div>

        <div className="admin-field">
          <label className="admin-field-label" htmlFor="excerpt">
            Краткое описание
          </label>
          <textarea
            className="admin-control admin-control--textarea"
            id="excerpt"
            name="excerpt"
            rows={3}
            defaultValue={item?.excerpt ?? ''}
          />
        </div>

        <div className="admin-form-grid-3">
          <div className="admin-field">
            <label className="admin-field-label" htmlFor="author">
              Автор
            </label>
            <input
              className="admin-control admin-control--input"
              id="author"
              name="author"
              defaultValue={item?.author.name ?? ''}
              required
            />
          </div>
          <div className="admin-field">
            <label className="admin-field-label" htmlFor="role">
              Должность
            </label>
            <input
              className="admin-control admin-control--input"
              id="role"
              name="role"
              defaultValue={item?.author.role ?? ''}
            />
          </div>
          <div className="admin-field">
            <label className="admin-field-label" htmlFor="readingTime">
              Минут чтения
            </label>
            <input
              className="admin-control admin-control--input"
              id="readingTime"
              name="readingTime"
              type="number"
              defaultValue={item?.readingTime ?? 3}
            />
          </div>
        </div>

        <div className="admin-field">
          <label className="admin-field-label" htmlFor="publishedAt">
            Дата публикации
          </label>
          <input
            className="admin-control admin-control--input"
            id="publishedAt"
            name="publishedAt"
            type="date"
            defaultValue={item?.publishedAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)}
            required
          />
        </div>

        <div className="admin-field">
          <label className="admin-field-label" htmlFor="cover">
            Обложка (URL)
          </label>
          <input
            className="admin-control admin-control--input"
            id="cover"
            name="cover"
            defaultValue={item?.cover ?? ''}
            required
          />
          {item?.cover ? (
            <Image src={item.cover} alt="" width={160} height={100} className="admin-preview-thumb" />
          ) : null}
        </div>

        <div className="admin-field">
          <label className="admin-field-label" htmlFor="featured">
            <input type="checkbox" id="featured" name="featured" defaultChecked={item?.featured} /> Показать на
            главной
          </label>
        </div>

        <div className="admin-field">
          <label className="admin-field-label" htmlFor="sectionsJson">
            Текст статьи (секции, JSON)
          </label>
          <textarea
            className="admin-control admin-control--textarea"
            id="sectionsJson"
            name="sectionsJson"
            rows={12}
            defaultValue={sectionsDefault}
          />
          <p className="admin-muted">Типы: paragraph, heading, quote, list.</p>
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn--accent">
            Сохранить
          </button>
          <Link href="/admin/articles" className="admin-btn admin-btn--outline">
            Отмена
          </Link>
          {!isNew ? (
            <button
              type="button"
              className="admin-btn admin-btn--danger admin-form-actions--end"
              onClick={() => setShowDelete(true)}
            >
              Удалить
            </button>
          ) : null}
        </div>
      </form>

      <AdminModal
        open={showDelete}
        title="Удалить статью?"
        onClose={() => setShowDelete(false)}
        footer={
          <>
            <button type="button" className="admin-btn admin-btn--outline" onClick={() => setShowDelete(false)}>
              Отмена
            </button>
            <form action={deleteArticleAction}>
              <input type="hidden" name="slug" value={item?.slug ?? ''} />
              <button type="submit" className="admin-btn admin-btn--danger">
                Удалить
              </button>
            </form>
          </>
        }
      >
        <p>Статья будет удалена из Payload без возможности восстановления.</p>
      </AdminModal>
    </>
  )
}
