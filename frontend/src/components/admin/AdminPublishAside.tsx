'use client'

import { AdminPendingSubmit } from '@/components/admin/AdminPendingSubmit'
import type { CaseStatus } from '@/content/types'

type StatusOption = { value: CaseStatus; label: string }

type AdminPublishAsideProps = {
  status: CaseStatus
  featured: boolean
  dirty: boolean
  galleryEmpty: boolean
  saveDisabled?: boolean
  showDelete?: boolean
  canPreview?: boolean
  statusOptions?: StatusOption[]
  deleteLabel?: string
  featuredLabel?: string
  previewHint?: string
  onStatusChange: (status: CaseStatus) => void
  onFeaturedChange: (featured: boolean) => void
  onCancel: () => void
  onDelete: () => void
}

const DEFAULT_STATUS_OPTIONS: StatusOption[] = [
  { value: 'draft', label: 'Черновик' },
  { value: 'published', label: 'Опубликовано' },
  { value: 'hidden', label: 'Скрыто' },
]

export function AdminPublishAside({
  status,
  featured,
  dirty,
  galleryEmpty,
  saveDisabled,
  showDelete,
  canPreview,
  statusOptions = DEFAULT_STATUS_OPTIONS,
  deleteLabel = 'Удалить кейс',
  featuredLabel = 'Отображать на главной',
  previewHint,
  onStatusChange,
  onFeaturedChange,
  onCancel,
  onDelete,
}: AdminPublishAsideProps) {
  const unpublishedHint =
    previewHint ??
    (canPreview
      ? 'Черновик / скрытый материал можно открыть через «Превью на сайте»'
      : 'Сохраните материал, чтобы открыть превью на сайте')

  return (
    <aside className="admin-edit-aside">
      <section className="admin-edit-card">
        <h2 className="admin-edit-section__title">Публикация</h2>

        <div className="admin-field">
          <label className="admin-field-label" htmlFor="statusSelect">
            Статус
          </label>
          <select
            id="statusSelect"
            className="admin-control admin-control--select"
            value={status}
            onChange={(e) => onStatusChange(e.target.value as CaseStatus)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <label className="admin-edit-check">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => onFeaturedChange(e.target.checked)}
          />
          <span>{featuredLabel}</span>
        </label>

        {status !== 'published' ? <p className="admin-muted">{unpublishedHint}</p> : null}

        <div className="admin-form-actions admin-edit-aside__actions">
          <AdminPendingSubmit disabled={saveDisabled || galleryEmpty} />
          <button type="button" className="admin-btn admin-btn--outline" onClick={onCancel}>
            Отмена
          </button>
        </div>

        {galleryEmpty ? (
          <p className="admin-edit-dirty-hint">Нужна хотя бы одна обложка в галерее</p>
        ) : dirty ? (
          <p className="admin-edit-dirty-hint">Есть несохранённые изменения</p>
        ) : null}

        {showDelete ? (
          <button type="button" className="admin-btn admin-btn--danger" onClick={onDelete}>
            {deleteLabel}
          </button>
        ) : null}
      </section>
    </aside>
  )
}
