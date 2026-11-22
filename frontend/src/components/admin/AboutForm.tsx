'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { AdminFlash, AdminSourceBanner } from '@/components/admin/AdminFlash'
import { AdminPendingSubmit } from '@/components/admin/AdminPendingSubmit'
import {
  AdminGalleryEditor,
  type GalleryFrame,
} from '@/components/admin/AdminGalleryEditor'
import {
  serializeGallery,
  snapshotsEqualWithGallery,
  toGalleryFrames,
} from '@/components/admin/galleryHelpers'
import { useAdminFormDirty } from '@/components/admin/useAdminFormDirty'
import { useGalleryUpload } from '@/components/admin/useGalleryUpload'
import type { SiteSettings } from '@/content/types'
import type { AdminDataSource } from '@/lib/admin/data'
import { saveAboutPageAction } from '@/lib/admin/content-actions'

type AboutFormProps = {
  settings: SiteSettings
  source: AdminDataSource
  saved?: boolean
  error?: string
}

type Snapshot = {
  aboutText: string
  years: string
  brands: string
  reachMillions: string
  gallery: GalleryFrame[]
}

function snapshotFrom(settings: SiteSettings): Snapshot {
  return {
    aboutText: settings.aboutText,
    years: String(settings.aboutStats.years),
    brands: String(settings.aboutStats.brands),
    reachMillions: String(settings.aboutStats.reachMillions),
    gallery: toGalleryFrames(Array.isArray(settings.aboutGallery) ? settings.aboutGallery : []),
  }
}

export function AboutForm({ settings, source, saved, error }: AboutFormProps) {
  const baselineRef = useRef(snapshotFrom(settings))
  const [aboutText, setAboutText] = useState(baselineRef.current.aboutText)
  const [years, setYears] = useState(baselineRef.current.years)
  const [brands, setBrands] = useState(baselineRef.current.brands)
  const [reachMillions, setReachMillions] = useState(baselineRef.current.reachMillions)
  const [gallery, setGallery] = useState<GalleryFrame[]>(() =>
    baselineRef.current.gallery.map((g) => ({ ...g })),
  )

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
    imagesOnly: true,
  })

  useEffect(() => {
    const next = snapshotFrom(settings)
    baselineRef.current = next
    setAboutText(next.aboutText)
    setYears(next.years)
    setBrands(next.brands)
    setReachMillions(next.reachMillions)
    setGallery(next.gallery.map((g) => ({ ...g })))
    setUploadError(null)
  }, [settings, saved, setUploadError])

  const current = useMemo(
    () => ({ aboutText, years, brands, reachMillions, gallery }),
    [aboutText, years, brands, reachMillions, gallery],
  )
  const dirty = !snapshotsEqualWithGallery(current, baselineRef.current)
  const { allowLeave, blockLeave } = useAdminFormDirty(dirty)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    if (uploadBusy) {
      e.preventDefault()
      blockLeave()
      return
    }
    allowLeave()
  }

  const galleryPayload = serializeGallery(gallery)

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-title">О нас</h1>
          {dirty ? <p className="admin-muted admin-edit-dirty">Не сохранено</p> : null}
        </div>
        <Link href="/about" className="admin-btn admin-btn--outline" target="_blank" rel="noreferrer">
          Открыть на сайте
        </Link>
      </div>

      <AdminSourceBanner source={source} />
      <AdminFlash saved={saved} error={error} />
      {uploadError ? <AdminFlash error={uploadError} /> : null}

      <form className="admin-form admin-form--wide" action={saveAboutPageAction} onSubmit={onSubmit}>
        <input type="hidden" name="galleryJson" value={JSON.stringify(galleryPayload)} />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => void handleGalleryFiles(e.target.files)}
        />

        <div className="admin-field">
          <label className="admin-field-label" htmlFor="aboutText">
            Описание
          </label>
          <textarea
            className="admin-control admin-control--textarea"
            id="aboutText"
            name="aboutText"
            rows={8}
            value={aboutText}
            onChange={(e) => setAboutText(e.target.value)}
            required
          />
        </div>

        <h2 className="admin-section-title">Цифры</h2>
        <div className="admin-form-grid-3">
          <div className="admin-field">
            <label className="admin-field-label" htmlFor="years">
              Лет
            </label>
            <input
              className="admin-control admin-control--input"
              id="years"
              name="years"
              type="number"
              min={0}
              value={years}
              onChange={(e) => setYears(e.target.value)}
              required
            />
          </div>
          <div className="admin-field">
            <label className="admin-field-label" htmlFor="brands">
              Брендов
            </label>
            <input
              className="admin-control admin-control--input"
              id="brands"
              name="brands"
              type="number"
              min={0}
              value={brands}
              onChange={(e) => setBrands(e.target.value)}
              required
            />
          </div>
          <div className="admin-field">
            <label className="admin-field-label" htmlFor="reachMillions">
              Охват (млн)
            </label>
            <input
              className="admin-control admin-control--input"
              id="reachMillions"
              name="reachMillions"
              type="number"
              min={0}
              value={reachMillions}
              onChange={(e) => setReachMillions(e.target.value)}
              required
            />
          </div>
        </div>

        <AdminGalleryEditor
          frames={gallery}
          onChange={setGallery}
          uploadBusy={uploadBusy}
          uploadProgress={uploadProgress}
          fileDropActive={fileDropActive}
          onAddClick={() => fileInputRef.current?.click()}
          onFileDragOver={onGalleryFileDragOver}
          onFileDragLeave={onGalleryFileDragLeave}
          onFileDrop={onGalleryFileDrop}
          title="Галерея"
          coverBadge="Главное"
          addLabel="Добавить фото"
        />

        <div className="admin-form-actions">
          <AdminPendingSubmit disabled={uploadBusy} />
          {dirty ? <p className="admin-edit-dirty-hint">Есть несохранённые изменения</p> : null}
        </div>
      </form>
    </>
  )
}
