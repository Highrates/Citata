'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { AdminFlash, AdminSourceBanner } from '@/components/admin/AdminFlash'
import { AdminModal } from '@/components/admin/AdminModal'
import { AdminPendingSubmit } from '@/components/admin/AdminPendingSubmit'
import { useAdminFormDirty } from '@/components/admin/useAdminFormDirty'
import { useSlugAvailability } from '@/components/admin/useSlugAvailability'
import { RichBlock } from '@/components/RichBlock/RichBlock'
import type { Service } from '@/content/types'
import type { AdminDataSource } from '@/lib/admin/data'
import {
  checkServiceSlugAction,
  deleteServiceAction,
  saveServiceAction,
} from '@/lib/admin/content-actions'
import { uploadAdminMedia, uploadAdminRichMedia } from '@/lib/admin/uploadMedia'
import { slugify } from '@/lib/slugify'

type ServiceEditFormProps = {
  item?: Service
  isNew?: boolean
  source: AdminDataSource
  saved?: boolean
  error?: string
}

type Snapshot = {
  title: string
  slug: string
  description: string
  image: string
  coverAlt: string
}

function snapshotFrom(item?: Service): Snapshot {
  return {
    title: item?.title ?? '',
    slug: item?.slug ?? '',
    description: item?.description ?? '',
    image: item?.image ?? '',
    coverAlt: item?.coverAlt ?? item?.title ?? '',
  }
}

export function ServiceEditForm({ item, isNew, source, saved, error }: ServiceEditFormProps) {
  const pathname = usePathname()
  const baselineRef = useRef(snapshotFrom(item))
  const itemKey = item?.slug ?? (isNew ? '__new__' : '')
  const excludeSlug = item?.slug
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(baselineRef.current.title)
  const [slug, setSlug] = useState(baselineRef.current.slug)
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [description, setDescription] = useState(baselineRef.current.description)
  const [image, setImage] = useState(baselineRef.current.image)
  const [coverAlt, setCoverAlt] = useState(baselineRef.current.coverAlt)
  const [uploadBusy, setUploadBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [showDelete, setShowDelete] = useState(false)

  const { slugCheck, slugHint, resetSlugCheck } = useSlugAvailability({
    slug,
    slugTouched,
    excludeSlug,
    check: checkServiceSlugAction,
  })

  useEffect(() => {
    const next = snapshotFrom(item)
    baselineRef.current = next
    setTitle(next.title)
    setSlug(next.slug)
    setDescription(next.description)
    setImage(next.image)
    setCoverAlt(next.coverAlt)
    setSlugTouched(!isNew)
    resetSlugCheck()
    setFormError(null)
    setUploadError(null)
    setShowDelete(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync on identity / save
  }, [itemKey, isNew, saved, resetSlugCheck])

  const current = useMemo(
    () => ({ title, slug, description, image, coverAlt }),
    [title, slug, description, image, coverAlt],
  )
  const dirty = JSON.stringify(current) !== JSON.stringify(baselineRef.current)
  const { isNavigatingAway, allowLeave, blockLeave, navigateAway } = useAdminFormDirty(dirty)

  const onTitleChange = useCallback(
    (value: string) => {
      setTitle(value)
      if (!slugTouched) setSlug(slugify(value))
    },
    [slugTouched],
  )

  async function handleCoverFile(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    setUploadError(null)
    setUploadBusy(true)
    try {
      const uploaded = await uploadAdminMedia(file, coverAlt || title || file.name)
      setImage(uploaded.url)
      if (!coverAlt.trim()) setCoverAlt(uploaded.alt || title || file.name)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setUploadBusy(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function validateBeforeSubmit(e: FormEvent<HTMLFormElement>) {
    const normalized = slugify(slug)
    if (normalized !== slug) setSlug(normalized)
    if (!title.trim() || !normalized) {
      e.preventDefault()
      setFormError('Заполните название и slug')
      blockLeave()
      return
    }
    if (!image.trim()) {
      e.preventDefault()
      setFormError('Добавьте обложку')
      blockLeave()
      return
    }
    if (slugCheck === 'taken' || slugCheck === 'invalid') {
      e.preventDefault()
      setFormError(
        slugCheck === 'taken' ? 'Slug уже занят — выберите другой' : 'Некорректный slug',
      )
      blockLeave()
      return
    }
    setFormError(null)
    allowLeave()
  }

  return (
    <>
      <div className="admin-back-link">
        <button
          type="button"
          className="admin-muted admin-linkish"
          onClick={() => navigateAway('/admin/services')}
        >
          ← Услуги
        </button>
      </div>

      <div className="admin-edit-head">
        <div>
          <h1 className="admin-title">{title.trim() || (isNew ? 'Новая услуга' : 'Услуга')}</h1>
          <p className="admin-muted admin-edit-head__meta">
            {slug ? `/services · ${slug}` : 'Укажите slug'}
            {dirty ? <span className="admin-edit-dirty"> · Не сохранено</span> : null}
          </p>
        </div>
      </div>

      <AdminSourceBanner source={source} />
      <AdminFlash saved={saved} error={error} />
      {formError ? <AdminFlash error={formError} /> : null}
      {uploadError ? <AdminFlash error={uploadError} /> : null}

      <form
        className="admin-form admin-form--wide admin-edit-form"
        action={saveServiceAction}
        onSubmit={validateBeforeSubmit}
      >
        <input type="hidden" name="returnPath" value={pathname} />
        {!isNew && item ? <input type="hidden" name="originalSlug" value={item.slug} /> : null}
        <input type="hidden" name="cover" value={image} />
        <input type="hidden" name="sortOrder" value={String(item?.sortOrder ?? 0)} />
        <input type="hidden" name="description" value={description} />

        <div className="admin-edit-layout">
          <div className="admin-edit-main">
            <section className="admin-edit-section">
              <div className="admin-field">
                <label className="admin-field-label" htmlFor="title">
                  Название
                </label>
                <input
                  className="admin-control admin-control--input"
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  required
                />
              </div>

              <div className="admin-field">
                <label className="admin-field-label" htmlFor="slug">
                  URL (slug)
                </label>
                <input
                  className="admin-control admin-control--input"
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true)
                    setSlug(slugify(e.target.value))
                  }}
                  required
                  aria-describedby={slugHint ? 'service-slug-hint' : undefined}
                />
                {slugHint ? (
                  <p
                    id="service-slug-hint"
                    className={`admin-field-hint${slugCheck === 'taken' || slugCheck === 'invalid' ? ' admin-field-hint--error' : ''}`}
                  >
                    {slugHint}
                  </p>
                ) : null}
              </div>
            </section>

            <section className="admin-edit-section">
              <div className="admin-edit-section__head">
                <h2 className="admin-edit-section__title">Описание</h2>
                <p className="admin-muted">Текст услуги</p>
              </div>
              <RichBlock
                value={description}
                onChange={setDescription}
                placeholder="Описание услуги…"
                variant="admin"
                locale="ru"
                uploadMedia={uploadAdminRichMedia}
              />
            </section>

            <section className="admin-edit-section">
              <div className="admin-edit-section__head">
                <h2 className="admin-edit-section__title">Обложка</h2>
                <p className="admin-muted">Превью при наведении на /services</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => void handleCoverFile(e.target.files)}
              />

              {image ? (
                <div className="service-cover-preview">
                  <Image
                    src={image}
                    alt={coverAlt || ''}
                    width={320}
                    height={420}
                    className="service-cover-preview__img"
                  />
                </div>
              ) : (
                <p className="admin-muted">Обложка ещё не загружена</p>
              )}

              <div className="admin-form-actions service-cover-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn--outline"
                  disabled={uploadBusy}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadBusy ? 'Загрузка…' : image ? 'Заменить обложку' : 'Загрузить обложку'}
                </button>
                {image ? (
                  <button
                    type="button"
                    className="admin-btn admin-btn--danger"
                    onClick={() => setImage('')}
                  >
                    Убрать
                  </button>
                ) : null}
              </div>

              <div className="admin-field service-cover-alt">
                <label className="admin-field-label" htmlFor="coverAlt">
                  Alt обложки
                </label>
                <input
                  className="admin-control admin-control--input"
                  id="coverAlt"
                  name="coverAlt"
                  value={coverAlt}
                  onChange={(e) => setCoverAlt(e.target.value)}
                />
              </div>
            </section>
          </div>

          <aside className="admin-edit-aside">
            <section className="admin-edit-card">
              <h2 className="admin-edit-section__title">Публикация</h2>
              <div className="admin-form-actions admin-edit-aside__actions">
                <AdminPendingSubmit
                  disabled={
                    uploadBusy ||
                    isNavigatingAway ||
                    !image ||
                    slugCheck === 'taken' ||
                    slugCheck === 'invalid'
                  }
                />
                <button
                  type="button"
                  className="admin-btn admin-btn--outline"
                  onClick={() => navigateAway('/admin/services')}
                >
                  Отмена
                </button>
              </div>
              {!image ? (
                <p className="admin-edit-dirty-hint">Нужна обложка</p>
              ) : dirty ? (
                <p className="admin-edit-dirty-hint">Есть несохранённые изменения</p>
              ) : null}
              {!isNew ? (
                <button
                  type="button"
                  className="admin-btn admin-btn--danger"
                  onClick={() => setShowDelete(true)}
                >
                  Удалить услугу
                </button>
              ) : null}
            </section>
          </aside>
        </div>
      </form>

      <AdminModal
        open={showDelete}
        title="Удалить услугу?"
        onClose={() => setShowDelete(false)}
        footer={
          <>
            <button
              type="button"
              className="admin-btn admin-btn--outline"
              onClick={() => setShowDelete(false)}
            >
              Отмена
            </button>
            <form
              action={deleteServiceAction}
              onSubmit={() => {
                allowLeave()
              }}
            >
              <input type="hidden" name="slug" value={item?.slug ?? ''} />
              <button type="submit" className="admin-btn admin-btn--danger">
                Удалить
              </button>
            </form>
          </>
        }
      >
        <p>Услуга будет удалена из Payload.</p>
      </AdminModal>
    </>
  )
}
