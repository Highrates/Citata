import type { ArticleSection } from '@/content/types'

type ArticleBodyProps = {
  sections?: ArticleSection[]
  description?: string
}

export function ArticleBody({ sections = [], description }: ArticleBodyProps) {
  if (description?.trim()) {
    return (
      <div
        className="article-body case-rich-html"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    )
  }

  return (
    <div className="article-body prose prose-neutral">
      {sections.map((section, index) => {
        switch (section.type) {
          case 'paragraph':
            return <p key={index}>{section.text}</p>
          case 'heading':
            return <h3 key={index}>{section.text}</h3>
          case 'quote':
            return (
              <blockquote key={index}>
                <p>{section.text}</p>
              </blockquote>
            )
          case 'list':
            return (
              <ul key={index}>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
