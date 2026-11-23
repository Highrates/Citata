'use client'

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Image from 'next/image'
import { useEffect, useId, useMemo, useRef, useState, type DragEvent } from 'react'
import type { GalleryItem } from '@/content/types'

export type GalleryFrame = GalleryItem & { id: string }

/** Safari/Chrome often need a media fragment to paint the first frame. */
function videoPreviewSrc(src: string) {
  if (!src || src.includes('#t=')) return src
  return `${src}#t=0.001`
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true',
  )
}

type AdminGalleryEditorProps = {
  frames: GalleryFrame[]
  onChange: (frames: GalleryFrame[]) => void
  uploadBusy?: boolean
  uploadProgress?: { done: number; total: number } | null
  fileDropActive?: boolean
  onAddClick: () => void
  onFileDragOver: (e: DragEvent) => void
  onFileDragLeave: (e: DragEvent) => void
  onFileDrop: (e: DragEvent) => void
  title?: string
  coverBadge?: string
  addLabel?: string
}

function GalleryLightbox({
  frames,
  index,
  onClose,
  onIndexChange,
}: {
  frames: GalleryFrame[]
  index: number
  onClose: () => void
  onIndexChange: (index: number) => void
}) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const frame = frames[index]
  const hasPrev = index > 0
  const hasNext = index < frames.length - 1

  useEffect(() => {
    previouslyFocused.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    const dialog = dialogRef.current
    const focusables = dialog ? getFocusable(dialog) : []
    ;(focusables[0] ?? dialog)?.focus()

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key === 'ArrowLeft' && hasPrev) {
        e.preventDefault()
        onIndexChange(index - 1)
        return
      }
      if (e.key === 'ArrowRight' && hasNext) {
        e.preventDefault()
        onIndexChange(index + 1)
        return
      }
      if (e.key !== 'Tab' || !dialogRef.current) return

      const nodes = getFocusable(dialogRef.current)
      if (nodes.length === 0) {
        e.preventDefault()
        dialogRef.current.focus()
        return
      }
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      const active = document.activeElement
      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
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
    <div
      className="case-gallery-lightbox"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="case-gallery-lightbox__stage"
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
          className="case-gallery-lightbox__close"
          aria-label="Закрыть"
          onClick={onClose}
        >
          ×
        </button>

        {hasPrev ? (
          <button
            type="button"
            className="case-gallery-lightbox__nav case-gallery-lightbox__nav--prev"
            aria-label="Предыдущее"
            onClick={() => onIndexChange(index - 1)}
          >
            ‹
          </button>
        ) : null}

        {hasNext ? (
          <button
            type="button"
            className="case-gallery-lightbox__nav case-gallery-lightbox__nav--next"
            aria-label="Следующее"
            onClick={() => onIndexChange(index + 1)}
          >
            ›
          </button>
        ) : null}

        {frame.kind === 'video' ? (
          <video
            className="case-gallery-lightbox__video"
            src={frame.src}
            controls
            autoPlay
            playsInline
            preload="metadata"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- fullscreen lightbox needs unconstrained sizing
          <img
            className="case-gallery-lightbox__img"
            src={frame.src}
            alt={frame.alt || ''}
          />
        )}

        {frame.alt ? <p className="case-gallery-lightbox__caption">{frame.alt}</p> : null}
      </div>
    </div>
  )
}

function SortableGalleryCard({
  frame,
  index,
  onRemove,
  onAltChange,
  onOpen,
  coverBadge = 'Обложка',
}: {
  frame: GalleryFrame
  index: number
  onRemove: () => void
  onAltChange: (alt: string) => void
  onOpen: () => void
  coverBadge?: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: frame.id,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  }

  return (
    <li ref={setNodeRef} style={style} className="case-gallery-card">
      <div className="case-gallery-card__media">
        <button
          type="button"
          className="case-gallery-card__handle"
          aria-label={`Переместить кадр ${index + 1}`}
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </button>
        {frame.kind === 'video' ? (
          <video
            className="case-gallery-card__video"
            src={videoPreviewSrc(frame.src)}
            muted
            playsInline
            preload="metadata"
            aria-hidden
          />
        ) : (
          <Image
            src={frame.src}
            alt=""
            fill
            sizes="160px"
            className="case-gallery-card__img"
          />
        )}
        <button
          type="button"
          className="case-gallery-card__open"
          aria-label={
            frame.kind === 'video'
              ? `Открыть видео${frame.alt ? `: ${frame.alt}` : ''}`
              : `Открыть изображение${frame.alt ? `: ${frame.alt}` : ''}`
          }
          onClick={onOpen}
        />
        {index === 0 ? <span className="case-gallery-card__badge">{coverBadge}</span> : null}
        {frame.kind === 'video' ? <span className="case-gallery-card__kind">Видео</span> : null}
        <button
          type="button"
          className="case-gallery-card__remove"
          aria-label="Удалить"
          onClick={onRemove}
        >
          ×
        </button>
      </div>
      <label className="case-gallery-card__alt">
        <span className="admin-field-label">Alt</span>
        <input
          className="admin-control admin-control--input"
          type="text"
          value={frame.alt}
          placeholder={index === 0 ? `Alt: ${coverBadge.toLowerCase()}` : 'Описание кадра'}
          onChange={(e) => onAltChange(e.target.value)}
        />
      </label>
    </li>
  )
}

function GalleryCardPreview({
  frame,
  index,
  coverBadge = 'Обложка',
}: {
  frame: GalleryFrame
  index: number
  coverBadge?: string
}) {
  return (
    <div className="case-gallery-card case-gallery-card--overlay">
      <div className="case-gallery-card__media">
        {frame.kind === 'video' ? (
          <video
            className="case-gallery-card__video"
            src={videoPreviewSrc(frame.src)}
            muted
            playsInline
            preload="metadata"
            aria-label={frame.alt || 'Видео'}
          />
        ) : (
          <Image
            src={frame.src}
            alt={frame.alt || ''}
            fill
            sizes="160px"
            className="case-gallery-card__img"
          />
        )}
        {index === 0 ? <span className="case-gallery-card__badge">{coverBadge}</span> : null}
      </div>
    </div>
  )
}

function FileDropZone({
  active,
  busy,
  onClick,
  onDragOver,
  onDragLeave,
  onDrop,
  compact,
}: {
  active?: boolean
  busy?: boolean
  onClick: () => void
  onDragOver: (e: DragEvent) => void
  onDragLeave: (e: DragEvent) => void
  onDrop: (e: DragEvent) => void
  compact?: boolean
}) {
  return (
    <button
      type="button"
      className={`case-gallery-empty${compact ? ' case-gallery-empty--compact' : ''}${
        active ? ' case-gallery-empty--active' : ''
      }`}
      disabled={busy}
      onClick={onClick}
      onDragEnter={onDragOver}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {compact
        ? 'Перетащите файлы сюда или нажмите, чтобы добавить'
        : 'Перетащите сюда файлы или нажмите, чтобы загрузить'}
    </button>
  )
}

export function AdminGalleryEditor({
  frames,
  onChange,
  uploadBusy,
  uploadProgress,
  fileDropActive,
  onAddClick,
  onFileDragOver,
  onFileDragLeave,
  onFileDrop,
  title = 'Галерея',
  coverBadge = 'Обложка',
  addLabel = 'Добавить фото / видео',
}: AdminGalleryEditorProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const ids = useMemo(() => frames.map((f) => f.id), [frames])
  const activeFrame = activeId ? frames.find((f) => f.id === activeId) : null
  const activeIndex = activeFrame ? frames.findIndex((f) => f.id === activeFrame.id) : -1

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return
    const oldIndex = frames.findIndex((f) => f.id === active.id)
    const newIndex = frames.findIndex((f) => f.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    onChange(arrayMove(frames, oldIndex, newIndex))
  }

  function onDragCancel() {
    setActiveId(null)
  }

  return (
    <section className="admin-edit-section">
      <div className="admin-edit-section__head admin-edit-section__head--row">
        <h2 className="admin-edit-section__title">{title}</h2>
        <button
          type="button"
          className="case-gallery-add"
          disabled={uploadBusy}
          aria-label={uploadBusy ? 'Загрузка…' : addLabel}
          title={uploadBusy ? 'Загрузка…' : addLabel}
          onClick={onAddClick}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path
              d="M9 3.5v11M3.5 9h11"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {uploadProgress ? (
        <p className="admin-muted case-gallery-progress" aria-live="polite">
          Загрузка {uploadProgress.done}/{uploadProgress.total}…
        </p>
      ) : null}

      {frames.length === 0 ? (
        <FileDropZone
          active={fileDropActive}
          busy={uploadBusy}
          onClick={onAddClick}
          onDragOver={onFileDragOver}
          onDragLeave={onFileDragLeave}
          onDrop={onFileDrop}
        />
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragCancel={onDragCancel}
          >
            <SortableContext items={ids} strategy={rectSortingStrategy}>
              <ul className="case-gallery-grid">
                {frames.map((frame, index) => (
                  <SortableGalleryCard
                    key={frame.id}
                    frame={frame}
                    index={index}
                    coverBadge={coverBadge}
                    onOpen={() => setLightboxIndex(index)}
                    onRemove={() => {
                      const label = index === 0 ? coverBadge.toLowerCase() : 'этот кадр'
                      if (!window.confirm(`Удалить ${label} из галереи?`)) return
                      onChange(frames.filter((f) => f.id !== frame.id))
                    }}
                    onAltChange={(alt) =>
                      onChange(frames.map((f) => (f.id === frame.id ? { ...f, alt } : f)))
                    }
                  />
                ))}
              </ul>
            </SortableContext>
            <DragOverlay>
              {activeFrame ? (
                <GalleryCardPreview
                  frame={activeFrame}
                  index={Math.max(0, activeIndex)}
                  coverBadge={coverBadge}
                />
              ) : null}
            </DragOverlay>
          </DndContext>

          {/* Separate from sortable grid — no file-drop / dnd-kit conflict */}
          <FileDropZone
            compact
            active={fileDropActive}
            busy={uploadBusy}
            onClick={onAddClick}
            onDragOver={onFileDragOver}
            onDragLeave={onFileDragLeave}
            onDrop={onFileDrop}
          />
        </>
      )}

      {lightboxIndex != null && frames[lightboxIndex] ? (
        <GalleryLightbox
          frames={frames}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      ) : null}
    </section>
  )
}
