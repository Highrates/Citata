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
import { useMemo, useState, type DragEvent } from 'react'
import type { CaseGalleryItem } from '@/content/types'

export type GalleryFrame = CaseGalleryItem & { id: string }

type CaseGalleryEditorProps = {
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

function SortableGalleryCard({
  frame,
  index,
  onRemove,
  onAltChange,
  coverBadge = 'Обложка',
}: {
  frame: GalleryFrame
  index: number
  onRemove: () => void
  onAltChange: (alt: string) => void
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
          <video src={frame.src} muted playsInline preload="metadata" />
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
          <video src={frame.src} muted playsInline preload="metadata" />
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

export function CaseGalleryEditor({
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
}: CaseGalleryEditorProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
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
    <section className="case-edit-section">
      <div className="case-edit-section__head case-edit-section__head--row">
        <h2 className="case-edit-section__title">{title}</h2>
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
    </section>
  )
}
