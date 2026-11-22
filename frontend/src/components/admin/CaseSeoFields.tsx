'use client'

type CaseSeoFieldsProps = {
  title: string
  summary: string
  seoTitle: string
  seoDescription: string
  onSeoTitleChange: (value: string) => void
  onSeoDescriptionChange: (value: string) => void
}

export function CaseSeoFields({
  title,
  summary,
  seoTitle,
  seoDescription,
  onSeoTitleChange,
  onSeoDescriptionChange,
}: CaseSeoFieldsProps) {
  return (
    <section className="case-edit-section">
      <div className="case-edit-section__head">
        <h2 className="case-edit-section__title">SEO</h2>
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
