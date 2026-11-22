'use client'

import { usePathname } from 'next/navigation'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { AdminFlash, AdminSourceBanner } from '@/components/admin/AdminFlash'
import { AdminModal } from '@/components/admin/AdminModal'
import {
  AdminGalleryEditor,
  type GalleryFrame,
} from '@/components/admin/AdminGalleryEditor'
import { AdminPublishAside } from '@/components/admin/AdminPublishAside'
import { AdminSeoFields } from '@/components/admin/AdminSeoFields'
import {
  initialCoverGallery,
  serializeGallery,
  snapshotsEqualWithGallery,
} from '@/components/admin/galleryHelpers'
import { useAdminFormDirty } from '@/components/admin/useAdminFormDirty'
import { useGalleryUpload } from '@/components/admin/useGalleryUpload'
import { useSlugAvailability } from '@/components/admin/useSlugAvailability'
import { RichBlock } from '@/components/RichBlock/RichBlock'
import type { Case, CaseStatus } from '@/content/types'
import type { AdminDataSource } from '@/lib/admin/data'
import { checkCaseSlugAction, deleteCaseAction, saveCaseAction } from '@/lib/admin/content-actions'
import { uploadAdminRichMedia } from '@/lib/admin/uploadMedia'
import { slugify } from '@/lib/slugify'

type CaseEditFormProps = {
  item?: Case
  isNew?: boolean
  source: AdminDataSource
  previewToken?: string | null
  saved?: boolean
  error?: string
}

type FormSnapshot = {
  title: string
  slug: string
  year: string
  summary: string
  heroTitle: string
  description: string
  seoTitle: string
  seoDescription: string
  status: CaseStatus
  featured: boolean
  gallery: GalleryFrame[]
}

function snapshotFrom(item: Case | undefined): FormSnapshot {
  return {
    title: item?.title ?? '',
    slug: item?.slug ?? '',
    year: String(item?.year ?? new Date().getFullYear()),
    summary: item?.summary ?? '',
    heroTitle: item?.heroTitle ?? '',
    description: item?.description ?? '',
    seoTitle: item?.seo?.title ?? '',
    seoDescription: item?.seo?.description ?? '',
    status: item?.status ?? 'draft',
    featured: item?.featured ?? false,
    gallery: initialCoverGallery({
      gallery: item?.gallery,
      cover: item?.cover,
      coverAlt: item?.coverAlt,
      title: item?.title,
    }),
  }
}

function applySnapshot(
  next: FormSnapshot,
  setters: {
    setTitle: (v: string) => void
    setSlug: (v: string) => void
    setYear: (v: string) => void
    setSummary: (v: string) => void
    setHeroTitle: (v: string) => void
    setDescription: (v: string) => void
    setSeoTitle: (v: string) => void
    setSeoDescription: (v: string) => void
    setStatus: (v: CaseStatus) => void
    setFeatured: (v: boolean) => void
    setGallery: (v: GalleryFrame[]) => void
  },
) {
  setters.setTitle(next.title)
  setters.setSlug(next.slug)
  setters.setYear(next.year)
  setters.setSummary(next.summary)
  setters.setHeroTitle(next.heroTitle)
  setters.setDescription(next.description)
  setters.setSeoTitle(next.seoTitle)
  setters.setSeoDescription(next.seoDescription)
  setters.setStatus(next.status)
  setters.setFeatured(next.featured)
  setters.setGallery(next.gallery.map((g) => ({ ...g })))
}

export function CaseEditForm({
  item,
  isNew,
  source,
  previewToken,
  saved,
  error,
}: CaseEditFormProps) {
  const pathname = usePathname()
  const [showDelete, setShowDelete] = useState(false)
  const baselineRef = useRef<FormSnapshot>(snapshotFrom(item))
  const itemKey = item?.slug ?? (isNew ? '__new__' : '')
  const excludeSlug = item?.slug

  const [title, setTitle] = useState(baselineRef.current.title)
  const [slug, setSlug] = useState(baselineRef.current.slug)
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [year, setYear] = useState(baselineRef.current.year)
  const [summary, setSummary] = useState(baselineRef.current.summary)
  const [heroTitle, setHeroTitle] = useState(baselineRef.current.heroTitle)
  const [description, setDescription] = useState(baselineRef.current.description)
  const [seoTitle, setSeoTitle] = useState(baselineRef.current.seoTitle)
  const [seoDescription, setSeoDescription] = useState(baselineRef.current.seoDescription)
  const [status, setStatus] = useState<CaseStatus>(baselineRef.current.status)
  const [featured, setFeatured] = useState(baselineRef.current.featured)
  const [gallery, setGallery] = useState<GalleryFrame[]>(() =>
    baselineRef.current.gallery.map((g) => ({ ...g })),
  )
  const [formError, setFormError] = useState<string | null>(null)

  const {
    uploadBusy,
    uploadProgress,
    uploadError,
    setUploadError,
    fileDropActive,
    fileInputRef,
    handleGalleryFiles,
    onGalleryFileDragOver,
    onGalleryFileDragLeave,
    onGalleryFileDrop,
  } = useGalleryUpload({
    setGallery,
    altFallback: title,
    onClearFormError: () => setFormError(null),
  })

  const { slugCheck, slugHint, resetSlugCheck } = useSlugAvailability({
    slug,
    slugTouched,
    excludeSlug,
    check: checkCaseSlugAction,
  })

  useEffect(() => {
    const next = snapshotFrom(item)
    baselineRef.current = next
    applySnapshot(next, {
      setTitle,
      setSlug,
      setYear,
      setSummary,
      setHeroTitle,
      setDescription,
      setSeoTitle,
      setSeoDescription,
      setStatus,
      setFeatured,
      setGallery,
    })
    setSlugTouched(!isNew)
    resetSlugCheck()
    setFormError(null)
    setUploadError(null)
    setShowDelete(false)
    // itemKey / saved: soft-nav between cases or post-save refresh without remount
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync on identity, not every item reference
  }, [itemKey, isNew, saved, resetSlugCheck, setUploadError])

  const pageTitle = title.trim() || (isNew ? 'Новый кейс' : 'Кейс')
  const cover = gallery[0]

  const currentSnapshot = useMemo<FormSnapshot>(
    () => ({
      title,
      slug,
      year,
      summary,
      heroTitle,
      description,
      seoTitle,
      seoDescription,
      status,
      featured,
      gallery,
    }),
    [
      title,
      slug,
      year,
      summary,
      heroTitle,
      description,
      seoTitle,
      seoDescription,
      status,
      featured,
      gallery,
    ],
  )

  const dirty = !snapshotsEqualWithGallery(currentSnapshot, baselineRef.current)
  const { isNavigatingAway, allowLeave, blockLeave, navigateAway } = useAdminFormDirty(dirty)

  const statusLabel = useMemo(() => {
    if (status === 'published') return 'Опубликовано'
    if (status === 'hidden') return 'Скрыто'
    return 'Черновик'
  }, [status])

  const onTitleChange = useCallback(
    (value: string) => {
      setTitle(value)
      if (!slugTouched) setSlug(slugify(value))
    },
    [slugTouched],
  )

  const onSlugChange = useCallback((value: string) => {
    setSlugTouched(true)
    setSlug(slugify(value))
  }, [])

  function validateBeforeSubmit(e: FormEvent<HTMLFormElement>) {
    const normalizedSlug = slugify(slug)
    if (normalizedSlug !== slug) setSlug(normalizedSlug)

    if (!gallery.length) {
      e.preventDefault()
      setFormError('Добавьте хотя бы одно фото или видео в галерею')
      blockLeave()
      return
    }
    if (!title.trim() || !normalizedSlug) {
      e.preventDefault()
      setFormError('Заполните название и slug')
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

  const publicSlug = slugify(slug)
  // Preview token is signed for the saved slug — use that path until re-save.
  const previewSlug = item?.slug || publicSlug
  const previewHref = !previewSlug || isNew
    ? null
    : status === 'published'
      ? `/works/${previewSlug}`
      : previewToken
        ? `/works/${previewSlug}?preview=${encodeURIComponent(previewToken)}`
        : null
  const previewLabel = status === 'published' ? 'Открыть на сайте' : 'Превью на сайте'
  const galleryPayload = serializeGallery(gallery)

  return (
    <>
      <div className="admin-back-link">
        <button type="button" className="admin-muted admin-linkish" onClick={() => navigateAway('/admin/cases')}>
          ← Кейсы
        </button>
      </div>

      <div className="admin-edit-head">
        <div>
          <h1 className="admin-title">{pageTitle}</h1>
          <p className="admin-muted admin-edit-head__meta">
            {publicSlug ? `/works/${publicSlug}` : 'Укажите slug'} · {statusLabel}
            {dirty ? <span className="admin-edit-dirty"> · Не сохранено</span> : null}
          </p>
        </div>
        {previewHref ? (
          <a
            href={previewHref}
            className="admin-btn admin-btn--outline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {previewLabel}
          </a>
        ) : null}
      </div>

      <AdminSourceBanner source={source} />
      <AdminFlash saved={saved} error={error} />
      {formError ? <AdminFlash error={formError} /> : null}
      {uploadError ? <AdminFlash error={uploadError} /> : null}

      <form
        className="admin-form admin-form--wide admin-edit-form"
        action={saveCaseAction}
        onSubmit={validateBeforeSubmit}
      >
        <input type="hidden" name="returnPath" value={pathname} />
        {!isNew && item ? <input type="hidden" name="originalSlug" value={item.slug} /> : null}
        <input type="hidden" name="galleryJson" value={JSON.stringify(galleryPayload)} />
        <input type="hidden" name="cover" value={cover?.src ?? ''} />
        <input type="hidden" name="description" value={description} />
        <input type="hidden" name="status" value={status} />
        {featured ? <input type="hidden" name="featured" value="on" /> : null}

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

              <div className="admin-form-grid-2">
                <div className="admin-field">
                  <label className="admin-field-label" htmlFor="year">
                    Год
                  </label>
                  <input
                    className="admin-control admin-control--input"
                    id="year"
                    name="year"
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
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
                    onChange={(e) => onSlugChange(e.target.value)}
                    onBlur={() => {
                      const next = slugify(slug)
                      if (next !== slug) setSlug(next)
                    }}
                    required
                    aria-invalid={slugCheck === 'taken' || slugCheck === 'invalid'}
                  />
                  {slugHint ? (
                    <p
                      className={`admin-field-hint${
                        slugCheck === 'taken' || slugCheck === 'invalid'
                          ? ' admin-field-hint--error'
                          : slugCheck === 'available'
                            ? ' admin-field-hint--ok'
                            : ''
                      }`}
                    >
                      {slugHint}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="admin-field">
                <label className="admin-field-label" htmlFor="heroTitle">
                  Заголовок на странице
                </label>
                <input
                  className="admin-control admin-control--input"
                  id="heroTitle"
                  name="heroTitle"
                  value={heroTitle}
                  placeholder={title || 'Если пусто — используется название'}
                  onChange={(e) => setHeroTitle(e.target.value)}
                />
              </div>

              <div className="admin-field">
                <label className="admin-field-label" htmlFor="summary">
                  Короткое описание
                </label>
                <textarea
                  className="admin-control admin-control--textarea"
                  id="summary"
                  name="summary"
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              </div>
            </section>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/mp4,video/webm,video/quicktime"
              multiple
              hidden
              onChange={(e) => void handleGalleryFiles(e.target.files)}
            />

            <AdminGalleryEditor
              frames={gallery}
              onChange={(next) => {
                setGallery(next)
                if (next.length) setFormError(null)
              }}
              uploadBusy={uploadBusy}
              uploadProgress={uploadProgress}
              fileDropActive={fileDropActive}
              onAddClick={() => fileInputRef.current?.click()}
              onFileDragOver={onGalleryFileDragOver}
              onFileDragLeave={onGalleryFileDragLeave}
              onFileDrop={onGalleryFileDrop}
            />

            <section className="admin-edit-section">
              <div className="admin-edit-section__head">
                <h2 className="admin-edit-section__title">Описание</h2>
                <p className="admin-muted">Основной текст страницы кейса</p>
              </div>
              <RichBlock
                value={description}
                onChange={setDescription}
                placeholder="Текст кейса…"
                variant="admin"
                locale="ru"
                uploadMedia={uploadAdminRichMedia}
              />
            </section>

            <AdminSeoFields
              title={title}
              summary={summary}
              seoTitle={seoTitle}
              seoDescription={seoDescription}
              onSeoTitleChange={setSeoTitle}
              onSeoDescriptionChange={setSeoDescription}
            />
          </div>

          <AdminPublishAside
            status={status}
            featured={featured}
            dirty={dirty}
            galleryEmpty={gallery.length === 0}
            saveDisabled={uploadBusy || isNavigatingAway || slugCheck === 'taken'}
            showDelete={!isNew}
            canPreview={Boolean(previewHref)}
            onStatusChange={setStatus}
            onFeaturedChange={setFeatured}
            onCancel={() => navigateAway('/admin/cases')}
            onDelete={() => setShowDelete(true)}
          />
        </div>
      </form>

      <AdminModal
        open={showDelete}
        title="Удалить кейс?"
        onClose={() => setShowDelete(false)}
        footer={
          <>
            <button type="button" className="admin-btn admin-btn--outline" onClick={() => setShowDelete(false)}>
              Отмена
            </button>
            <form
              action={deleteCaseAction}
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
        <p>Кейс будет удалён из Payload без возможности восстановления.</p>
      </AdminModal>
    </>
  )
}
