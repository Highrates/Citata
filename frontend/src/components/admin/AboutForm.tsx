'use client'

import Link from 'next/link'
import { useRef, useState, type DragEvent } from 'react'
import { AdminFlash, AdminSourceBanner } from '@/components/admin/AdminFlash'
import {
  CaseGalleryEditor,
  type GalleryFrame,
} from '@/components/admin/CaseGalleryEditor'
import type { CaseGalleryItem, SiteSettings } from '@/content/types'
import type { AdminDataSource } from '@/lib/admin/data'
import { saveAboutPageAction } from '@/lib/admin/content-actions'
import { uploadAdminMedia } from '@/lib/admin/uploadMedia'

type AboutFormProps = {
  settings: SiteSettings
  source: AdminDataSource
  saved?: boolean
  error?: string
}

let galleryIdSeq = 0
function nextGalleryId() {
  galleryIdSeq += 1
  return `g-${Date.now()}-${galleryIdSeq}`
}

function toFrames(items: CaseGalleryItem[]): GalleryFrame[] {
  return items.map((g) => ({ ...g, id: nextGalleryId() }))
}

function serializeGallery(frames: GalleryFrame[]): CaseGalleryItem[] {
  return frames.map(({ src, alt, kind }) => ({ src, alt, kind }))
}

export function AboutForm({ settings, source, saved, error }: AboutFormProps) {
  const [gallery, setGallery] = useState<GalleryFrame[]>(() =>
    toFrames(Array.isArray(settings.aboutGallery) ? settings.aboutGallery : []),
  )
  const [uploadBusy, setUploadBusy] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [fileDropActive, setFileDropActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleGalleryFiles(files: FileList | null) {
    if (!files?.length) return
    const list = Array.from(files)
    setUploadError(null)
    setUploadBusy(true)
    setUploadProgress({ done: 0, total: list.length })

    const results = await Promise.allSettled(
      list.map(async (file) => {
        if (!file.type.startsWith('image/')) {
          throw new Error(`Только изображения: ${file.name}`)
        }
        const uploaded = await uploadAdminMedia(file, file.name)
        setUploadProgress((prev) =>
          prev ? { ...prev, done: Math.min(prev.total, prev.done + 1) } : prev,
        )
        return {
          id: nextGalleryId(),
          src: uploaded.url,
          alt: uploaded.alt || file.name,
          kind: 'image' as const,
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

  const galleryPayload = serializeGallery(gallery)

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-title">О нас</h1>
        </div>
        <Link href="/about" className="admin-btn admin-btn--outline" target="_blank" rel="noreferrer">
          Открыть на сайте
        </Link>
      </div>

      <AdminSourceBanner source={source} />
      <AdminFlash saved={saved} error={error} />
      {uploadError ? <AdminFlash error={uploadError} /> : null}

      <form className="admin-form admin-form--wide" action={saveAboutPageAction}>
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
            defaultValue={settings.aboutText}
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
              defaultValue={settings.aboutStats.years}
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
              defaultValue={settings.aboutStats.brands}
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
              defaultValue={settings.aboutStats.reachMillions}
              required
            />
          </div>
        </div>

        <CaseGalleryEditor
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
          <button type="submit" className="admin-btn admin-btn--accent" disabled={uploadBusy}>
            Сохранить
          </button>
        </div>
      </form>
    </>
  )
}
