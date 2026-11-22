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
import type { Article, ArticleStatus, CaseStatus } from '@/content/types'
import type { AdminDataSource } from '@/lib/admin/data'
import {
  checkArticleSlugAction,
  deleteArticleAction,
  saveArticleAction,
} from '@/lib/admin/content-actions'
import { uploadAdminRichMedia } from '@/lib/admin/uploadMedia'
import { sectionsToHtml } from '@/lib/map-article'
import { slugify } from '@/lib/slugify'

type ArticleEditFormProps = {
  item?: Article
  isNew?: boolean
  source: AdminDataSource
  saved?: boolean
  error?: string
}

type FormSnapshot = {
  title: string
  slug: string
  excerpt: string
  author: string
  role: string
  readingTime: string
  publishedAt: string
  description: string
  seoTitle: string
  seoDescription: string
  status: ArticleStatus
  featured: boolean
  gallery: GalleryFrame[]
}

const ARTICLE_STATUS_OPTIONS: { value: CaseStatus; label: string }[] = [
  { value: 'draft', label: 'Черновик' },
  { value: 'published', label: 'Опубликовано' },
]

function initialDescription(item?: Article): string {
  if (item?.description?.trim()) return item.description
  if (item?.sections?.length) return sectionsToHtml(item.sections)
  return ''
}

function snapshotFrom(item: Article | undefined): FormSnapshot {
  return {
    title: item?.title ?? '',
    slug: item?.slug ?? '',
    excerpt: item?.excerpt ?? '',
    author: item?.author.name ?? '',
    role: item?.author.role ?? '',
    readingTime: String(item?.readingTime ?? 3),
    publishedAt: item?.publishedAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    description: initialDescription(item),
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
    setExcerpt: (v: string) => void
    setAuthor: (v: string) => void
    setRole: (v: string) => void
    setReadingTime: (v: string) => void
    setPublishedAt: (v: string) => void
    setDescription: (v: string) => void
    setSeoTitle: (v: string) => void
    setSeoDescription: (v: string) => void
    setStatus: (v: ArticleStatus) => void
    setFeatured: (v: boolean) => void
    setGallery: (v: GalleryFrame[]) => void
  },
) {
  setters.setTitle(next.title)
  setters.setSlug(next.slug)
  setters.setExcerpt(next.excerpt)
  setters.setAuthor(next.author)
  setters.setRole(next.role)
  setters.setReadingTime(next.readingTime)
  setters.setPublishedAt(next.publishedAt)
  setters.setDescription(next.description)
  setters.setSeoTitle(next.seoTitle)
  setters.setSeoDescription(next.seoDescription)
  setters.setStatus(next.status)
  setters.setFeatured(next.featured)
  setters.setGallery(next.gallery.map((g) => ({ ...g })))
}

export function ArticleEditForm({
  item,
  isNew,
  source,
  saved,
  error,
}: ArticleEditFormProps) {
  const pathname = usePathname()
  const [showDelete, setShowDelete] = useState(false)
  const baselineRef = useRef<FormSnapshot>(snapshotFrom(item))
  const itemKey = item?.slug ?? (isNew ? '__new__' : '')
  const excludeSlug = item?.slug

  const [title, setTitle] = useState(baselineRef.current.title)
  const [slug, setSlug] = useState(baselineRef.current.slug)
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [excerpt, setExcerpt] = useState(baselineRef.current.excerpt)
  const [author, setAuthor] = useState(baselineRef.current.author)
  const [role, setRole] = useState(baselineRef.current.role)
  const [readingTime, setReadingTime] = useState(baselineRef.current.readingTime)
  const [publishedAt, setPublishedAt] = useState(baselineRef.current.publishedAt)
  const [description, setDescription] = useState(baselineRef.current.description)
  const [seoTitle, setSeoTitle] = useState(baselineRef.current.seoTitle)
  const [seoDescription, setSeoDescription] = useState(baselineRef.current.seoDescription)
  const [status, setStatus] = useState<ArticleStatus>(baselineRef.current.status)
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
    check: checkArticleSlugAction,
  })

  useEffect(() => {
    const next = snapshotFrom(item)
    baselineRef.current = next
    applySnapshot(next, {
      setTitle,
      setSlug,
      setExcerpt,
      setAuthor,
      setRole,
      setReadingTime,
      setPublishedAt,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync on identity, not every item reference
  }, [itemKey, isNew, saved, resetSlugCheck, setUploadError])

  const pageTitle = title.trim() || (isNew ? 'Новая статья' : 'Статья')
  const cover = gallery[0]

  const currentSnapshot = useMemo<FormSnapshot>(
    () => ({
      title,
      slug,
      excerpt,
      author,
      role,
      readingTime,
      publishedAt,
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
      excerpt,
      author,
      role,
      readingTime,
      publishedAt,
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
      setFormError('Заполните заголовок и slug')
      blockLeave()
      return
    }
    if (!author.trim()) {
      e.preventDefault()
      setFormError('Укажите автора')
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
  const previewHref =
    !publicSlug || isNew || status !== 'published' ? null : `/articles/${publicSlug}`
  const galleryPayload = serializeGallery(gallery)

  return (
    <>
      <div className="admin-back-link">
        <button
          type="button"
          className="admin-muted admin-linkish"
          onClick={() => navigateAway('/admin/articles')}
        >
          ← Статьи
        </button>
      </div>

      <div className="admin-edit-head">
        <div>
          <h1 className="admin-title">{pageTitle}</h1>
          <p className="admin-muted admin-edit-head__meta">
            {publicSlug ? `/articles/${publicSlug}` : 'Укажите slug'} · {statusLabel}
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
            Открыть на сайте
          </a>
        ) : null}
      </div>

      <AdminSourceBanner source={source} />
      <AdminFlash saved={saved} error={error} />
      {formError ? <AdminFlash error={formError} /> : null}
      {uploadError ? <AdminFlash error={uploadError} /> : null}

      <form
        className="admin-form admin-form--wide admin-edit-form"
        action={saveArticleAction}
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
                  Заголовок
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
                <div className="admin-field">
                  <label className="admin-field-label" htmlFor="publishedAt">
                    Дата публикации
                  </label>
                  <input
                    className="admin-control admin-control--input"
                    id="publishedAt"
                    name="publishedAt"
                    type="date"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    required
                  />
                </div>
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
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
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
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
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
                    min={1}
                    value={readingTime}
                    onChange={(e) => setReadingTime(e.target.value)}
                  />
                </div>
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
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
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
                <h2 className="admin-edit-section__title">Текст статьи</h2>
                <p className="admin-muted">Основной текст страницы статьи</p>
              </div>
              <RichBlock
                value={description}
                onChange={setDescription}
                placeholder="Текст статьи…"
                variant="admin"
                locale="ru"
                uploadMedia={uploadAdminRichMedia}
              />
            </section>

            <AdminSeoFields
              title={title}
              summary={excerpt}
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
            statusOptions={ARTICLE_STATUS_OPTIONS}
            deleteLabel="Удалить статью"
            featuredLabel="Выводить на главную"
            previewHint="Опубликуйте статью, чтобы открыть её на сайте"
            onStatusChange={(next) => setStatus(next === 'published' ? 'published' : 'draft')}
            onFeaturedChange={setFeatured}
            onCancel={() => navigateAway('/admin/articles')}
            onDelete={() => setShowDelete(true)}
          />
        </div>
      </form>

      <AdminModal
        open={showDelete}
        title="Удалить статью?"
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
              action={deleteArticleAction}
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
        <p>Статья будет удалена из Payload без возможности восстановления.</p>
      </AdminModal>
    </>
  )
}
