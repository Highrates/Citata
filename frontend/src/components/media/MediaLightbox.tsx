'use client'

import { useEffect, useId, useRef } from 'react'
import type { GalleryItem } from '@/content/types'

type MediaLightboxProps = {
  frames: GalleryItem[]
  index: number
  onClose: () => void
  onIndexChange: (index: number) => void
}

export function MediaLightbox({ frames, index, onClose, onIndexChange }: MediaLightboxProps) {
  const frame = frames[index]
  const dialogRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const hasPrev = index > 0
  const hasNext = index < frames.length - 1

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowLeft' && hasPrev) {
        e.preventDefault()
        onIndexChange(index - 1)
      } else if (e.key === 'ArrowRight' && hasNext) {
        e.preventDefault()
        onIndexChange(index + 1)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      previouslyFocused.current?.focus?.()
    }
  }, [hasNext, hasPrev, index, onClose, onIndexChange])

  if (!frame) return null

  return (
    <div className="media-lightbox" role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className="media-lightbox__stage"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <p id={titleId} className="sr-only">
          {frame.alt || (frame.kind === 'video' ? 'Видео' : 'Изображение')}
          {frames.length > 1 ? ` (${index + 1} из ${frames.length})` : ''}
        </p>

        <button
          type="button"
          className="media-lightbox__close"
          aria-label="Закрыть"
          onClick={onClose}
        >
          ×
        </button>

        {hasPrev ? (
          <button
            type="button"
            className="media-lightbox__nav media-lightbox__nav--prev"
            aria-label="Предыдущее"
            onClick={() => onIndexChange(index - 1)}
          >
            ‹
          </button>
        ) : null}

        {hasNext ? (
          <button
            type="button"
            className="media-lightbox__nav media-lightbox__nav--next"
            aria-label="Следующее"
            onClick={() => onIndexChange(index + 1)}
          >
            ›
          </button>
        ) : null}

        {frame.kind === 'video' ? (
          <video
            className="media-lightbox__video"
            src={frame.src}
            controls
            autoPlay
            playsInline
            preload="metadata"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- fullscreen needs unconstrained sizing
          <img className="media-lightbox__img" src={frame.src} alt={frame.alt || ''} />
        )}

        {frame.alt ? <p className="media-lightbox__caption">{frame.alt}</p> : null}
      </div>
    </div>
  )
}
