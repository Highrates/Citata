'use client'

import { useFormStatus } from 'react-dom'
import type { CaseStatus } from '@/content/types'

type CasePublishAsideProps = {
  status: CaseStatus
  featured: boolean
  dirty: boolean
  galleryEmpty: boolean
  saveDisabled?: boolean
  showDelete?: boolean
  canPreview?: boolean
  onStatusChange: (status: CaseStatus) => void
  onFeaturedChange: (featured: boolean) => void
  onCancel: () => void
  onDelete: () => void
}

function SaveButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="admin-btn admin-btn--accent" disabled={disabled || pending}>
      {pending ? 'Сохранение…' : 'Сохранить'}
    </button>
  )
}

export function CasePublishAside({
  status,
  featured,
  dirty,
  galleryEmpty,
  saveDisabled,
  showDelete,
  canPreview,
  onStatusChange,
  onFeaturedChange,
  onCancel,
  onDelete,
}: CasePublishAsideProps) {
  return (
    <aside className="case-edit-aside">
      <section className="case-edit-card">
        <h2 className="case-edit-section__title">Публикация</h2>

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
            <option value="draft">Черновик</option>
            <option value="published">Опубликовано</option>
            <option value="hidden">Скрыто</option>
          </select>
        </div>

        <label className="case-edit-check">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => onFeaturedChange(e.target.checked)}
          />
          <span>Отображать на главной</span>
        </label>

        {status !== 'published' ? (
          <p className="admin-muted">
            {canPreview
              ? 'Черновик / скрытый кейс можно открыть через «Превью на сайте»'
              : 'Сохраните кейс, чтобы открыть превью на сайте'}
          </p>
        ) : null}

        <div className="admin-form-actions case-edit-aside__actions">
          <SaveButton disabled={saveDisabled || galleryEmpty} />
          <button type="button" className="admin-btn admin-btn--outline" onClick={onCancel}>
            Отмена
          </button>
        </div>

        {galleryEmpty ? (
          <p className="case-edit-dirty-hint">Нужна хотя бы одна обложка в галерее</p>
        ) : dirty ? (
          <p className="case-edit-dirty-hint">Есть несохранённые изменения</p>
        ) : null}

        {showDelete ? (
          <button type="button" className="admin-btn admin-btn--danger" onClick={onDelete}>
            Удалить кейс
          </button>
        ) : null}
      </section>
    </aside>
  )
}
