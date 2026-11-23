'use client'

import {
  useCallback,
  useRef,
  useState,
  type Dispatch,
  type DragEvent,
  type SetStateAction,
} from 'react'
import type { GalleryFrame } from '@/components/admin/AdminGalleryEditor'
import { kindFromFile, nextGalleryId } from '@/components/admin/galleryHelpers'
import { uploadAdminMedia } from '@/lib/admin/uploadMedia'

type UseGalleryUploadOptions = {
  setGallery: Dispatch<SetStateAction<GalleryFrame[]>>
  altFallback?: string
  /** Restrict uploads to images only (about page). */
  imagesOnly?: boolean
  onClearFormError?: () => void
}

export function useGalleryUpload({
  setGallery,
  altFallback = '',
  imagesOnly = false,
  onClearFormError,
}: UseGalleryUploadOptions) {
  const [uploadBusy, setUploadBusy] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(
    null,
  )
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [fileDropActive, setFileDropActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleGalleryFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return
      const list = Array.from(files)
      setUploadError(null)
      onClearFormError?.()
      setUploadBusy(true)
      setUploadProgress({ done: 0, total: list.length })

      const results = await Promise.allSettled(
        list.map(async (file) => {
          if (imagesOnly) {
            if (!file.type.startsWith('image/')) {
              throw new Error(`Только изображения: ${file.name}`)
            }
          } else if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            throw new Error(`Неподдерживаемый файл: ${file.name}`)
          }

          const uploaded = await uploadAdminMedia(file, altFallback || file.name)
          setUploadProgress((prev) =>
            prev ? { ...prev, done: Math.min(prev.total, prev.done + 1) } : prev,
          )
          return {
            id: nextGalleryId(),
            src: uploaded.url,
            alt: uploaded.alt || altFallback || file.name,
            kind: imagesOnly ? ('image' as const) : kindFromFile(file),
            mediaId: uploaded.id,
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
    },
    [altFallback, imagesOnly, onClearFormError, setGallery],
  )

  const onGalleryFileDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if ([...e.dataTransfer.types].includes('Files')) setFileDropActive(true)
  }, [])

  const onGalleryFileDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFileDropActive(false)
  }, [])

  const onGalleryFileDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setFileDropActive(false)
      void handleGalleryFiles(e.dataTransfer.files)
    },
    [handleGalleryFiles],
  )

  return {
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
  }
}
