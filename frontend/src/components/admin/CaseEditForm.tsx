'use client'

import { usePathname } from 'next/navigation'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from 'react'
import { AdminFlash, AdminSourceBanner } from '@/components/admin/AdminFlash'
import { AdminModal } from '@/components/admin/AdminModal'
import {
  CaseGalleryEditor,
  type GalleryFrame,
} from '@/components/admin/CaseGalleryEditor'
import { CasePublishAside } from '@/components/admin/CasePublishAside'
import { CaseSeoFields } from '@/components/admin/CaseSeoFields'
import { useCaseFormDirty } from '@/components/admin/useCaseFormDirty'
import { RichBlock } from '@/components/RichBlock/RichBlock'
import type { Case, CaseGalleryItem, CaseStatus } from '@/content/types'
import type { AdminDataSource } from '@/lib/admin/data'
import { checkCaseSlugAction, deleteCaseAction, saveCaseAction } from '@/lib/admin/content-actions'
import { uploadAdminMedia, uploadAdminRichMedia } from '@/lib/admin/uploadMedia'
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

type SlugCheck = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

let galleryIdSeq = 0
function nextGalleryId() {
  galleryIdSeq += 1
  return `g-${Date.now()}-${galleryIdSeq}`
}

function kindFromFile(file: File): 'image' | 'video' {
  if (file.type.startsWith('video/')) return 'video'
  return 'image'
}

function kindFromSrc(src: string, mime?: string): 'image' | 'video' {
  if (mime?.startsWith('video/')) return 'video'
  if (/\.(mp4|webm|mov)(\?|$)/i.test(src)) return 'video'
  return 'image'
}

function toFrames(items: CaseGalleryItem[]): GalleryFrame[] {
  return items.map((g) => ({ ...g, id: nextGalleryId() }))
}

function initialGallery(item?: Case): GalleryFrame[] {
  if (item?.gallery?.length) return toFrames(item.gallery)
  if (item?.cover) {
    return toFrames([
      {
        src: item.cover,
        alt: item.coverAlt || item.title,
        kind: kindFromSrc(item.cover),
      },
    ])
  }
  return []
}

function serializeGallery(frames: GalleryFrame[]): CaseGalleryItem[] {
  return frames.map(({ src, alt, kind }) => ({ src, alt, kind }))
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
    gallery: initialGallery(item),
  }
}

function snapshotsEqual(a: FormSnapshot, b: FormSnapshot) {
  const strip = (s: FormSnapshot) => ({
    ...s,
    gallery: serializeGallery(s.gallery),
  })
  return JSON.stringify(strip(a)) === JSON.stringify(strip(b))
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
  const [slugCheck, setSlugCheck] = useState<SlugCheck>('idle')
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
  const [uploadBusy, setUploadBusy] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [fileDropActive, setFileDropActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const slugCheckSeq = useRef(0)

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
    setSlugCheck('idle')
    setFormError(null)
    setUploadError(null)
    setShowDelete(false)
    // itemKey / saved: soft-nav between cases or post-save refresh without remount
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync on identity, not every item reference
  }, [itemKey, isNew, saved])

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

  const dirty = !snapshotsEqual(currentSnapshot, baselineRef.current)
  const { isNavigatingAway, allowLeave, blockLeave, navigateAway } = useCaseFormDirty(dirty)

  const statusLabel = useMemo(() => {
    if (status === 'published') return 'Опубликовано'
    if (status === 'hidden') return 'Скрыто'
    return 'Черновик'
  }, [status])

  const runSlugCheck = useCallback(
    async (value: string) => {
      const normalized = slugify(value)
      if (!normalized) {
        setSlugCheck('invalid')
        return
      }

      const seq = ++slugCheckSeq.current
      setSlugCheck('checking')
      const result = await checkCaseSlugAction(normalized, excludeSlug)
      if (seq !== slugCheckSeq.current) return

      if (!result.slug) {
        setSlugCheck('invalid')
        return
      }
      setSlugCheck(result.available ? 'available' : 'taken')
    },
    [excludeSlug],
  )

  useEffect(() => {
    if (!slugTouched && !slug) {
      setSlugCheck('idle')
      return
    }
    const handle = window.setTimeout(() => {
      void runSlugCheck(slug)
    }, 320)
    return () => window.clearTimeout(handle)
  }, [slug, slugTouched, runSlugCheck])

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

  async function handleGalleryFiles(files: FileList | null) {
    if (!files?.length) return
    const list = Array.from(files)
    setUploadError(null)
    setFormError(null)
    setUploadBusy(true)
    setUploadProgress({ done: 0, total: list.length })

    const results = await Promise.allSettled(
      list.map(async (file) => {
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          throw new Error(`Неподдерживаемый файл: ${file.name}`)
        }
        const uploaded = await uploadAdminMedia(file, title || file.name)
        setUploadProgress((prev) =>
          prev ? { ...prev, done: Math.min(prev.total, prev.done + 1) } : prev,
        )
        return {
          id: nextGalleryId(),
          src: uploaded.url,
          alt: uploaded.alt || title || file.name,
          kind: kindFromFile(file),
        } satisfies GalleryFrame
      }),
    )

    const next: GalleryFrame[] = []
    const errors: string[] = []
    for (const result of results) {
      if (result.status === 'fulfilled') next.push(result.value)
      else errors.push(result.reason instanceof Error ? result.reason.message : 'Ошибка загрузки')
    }

    if (next.length) setGallery((prev) => [...prev, ...next])
    if (errors.length) setUploadError(errors[0] ?? 'Ошибка загрузки')

    setUploadBusy(false)
    setUploadProgress(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function onGalleryFileDragOver(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if ([...e.dataTransfer.types].includes('Files')) setFileDropActive(true)
  }

  function onGalleryFileDragLeave(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setFileDropActive(false)
  }

  function onGalleryFileDrop(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setFileDropActive(false)
    void handleGalleryFiles(e.dataTransfer.files)
  }

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
  const previewHref = !publicSlug || isNew
    ? null
    : status === 'published'
      ? `/works/${publicSlug}`
      : previewToken
        ? `/works/${publicSlug}?preview=${encodeURIComponent(previewToken)}`
        : null
  const previewLabel = status === 'published' ? 'Открыть на сайте' : 'Превью на сайте'
  const galleryPayload = serializeGallery(gallery)

  const slugHint =
    slugCheck === 'checking'
      ? 'Проверка…'
      : slugCheck === 'taken'
        ? 'Slug уже занят'
        : slugCheck === 'invalid'
          ? 'Slug пуст после нормализации'
          : slugCheck === 'available'
            ? 'Slug свободен'
            : null

  return (
    <>
      <div className="admin-back-link">
        <button type="button" className="admin-muted admin-linkish" onClick={() => navigateAway('/admin/cases')}>
          ← Кейсы
        </button>
      </div>

      <div className="case-edit-head">
        <div>
          <h1 className="admin-title">{pageTitle}</h1>
          <p className="admin-muted case-edit-head__meta">
            {publicSlug ? `/works/${publicSlug}` : 'Укажите slug'} · {statusLabel}
            {dirty ? <span className="case-edit-dirty"> · Не сохранено</span> : null}
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
        className="admin-form admin-form--wide case-edit-form"
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

        <div className="case-edit-layout">
          <div className="case-edit-main">
            <section className="case-edit-section">
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

            <CaseGalleryEditor
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

            <section className="case-edit-section">
              <div className="case-edit-section__head">
                <h2 className="case-edit-section__title">Описание</h2>
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

            <CaseSeoFields
              title={title}
              summary={summary}
              seoTitle={seoTitle}
              seoDescription={seoDescription}
              onSeoTitleChange={setSeoTitle}
              onSeoDescriptionChange={setSeoDescription}
            />
          </div>

          <CasePublishAside
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
