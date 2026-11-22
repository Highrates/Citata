'use client'

type AdminSeoFieldsProps = {
  title: string
  summary: string
  seoTitle: string
  seoDescription: string
  onSeoTitleChange: (value: string) => void
  onSeoDescriptionChange: (value: string) => void
}

export function AdminSeoFields({
  title,
  summary,
  seoTitle,
  seoDescription,
  onSeoTitleChange,
  onSeoDescriptionChange,
}: AdminSeoFieldsProps) {
  return (
    <section className="admin-edit-section">
      <div className="admin-edit-section__head">
        <h2 className="admin-edit-section__title">SEO</h2>
        <p className="admin-muted">Title и description для поисковиков и соцсетей</p>
      </div>
      <div className="admin-field">
        <label className="admin-field-label" htmlFor="seoTitle">
          SEO title
        </label>
        <input
          className="admin-control admin-control--input"
          id="seoTitle"
          name="seoTitle"
          value={seoTitle}
          placeholder={title ? `${title} — ЦИТАТА` : 'Заголовок в поиске'}
          onChange={(e) => onSeoTitleChange(e.target.value)}
        />
      </div>
      <div className="admin-field">
        <label className="admin-field-label" htmlFor="seoDescription">
          SEO description
        </label>
        <textarea
          className="admin-control admin-control--textarea"
          id="seoDescription"
          name="seoDescription"
          rows={3}
          value={seoDescription}
          placeholder={summary || 'Краткое описание для сниппета'}
          onChange={(e) => onSeoDescriptionChange(e.target.value)}
        />
      </div>
    </section>
  )
}
