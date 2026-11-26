import Link from 'next/link'

export type BreadcrumbItem = {
  name: string
  href?: string
}

type PageBreadcrumbsProps = {
  items: BreadcrumbItem[]
  className?: string
}

/** Visible trail under SiteBar (JSON-LD stays separate via breadcrumbJsonLd). */
export function PageBreadcrumbs({ items, className }: PageBreadcrumbsProps) {
  if (items.length < 2) return null

  return (
    <nav
      className={['page-breadcrumbs', className].filter(Boolean).join(' ')}
      aria-label="Навигация"
    >
      <ol className="page-breadcrumbs__list">
        {items.map((item, index) => {
          const last = index === items.length - 1
          return (
            <li key={`${item.name}-${index}`} className="page-breadcrumbs__item">
              {index > 0 ? (
                <span className="page-breadcrumbs__sep" aria-hidden="true">
                  /
                </span>
              ) : null}
              {last || !item.href ? (
                <span className="page-breadcrumbs__current" aria-current={last ? 'page' : undefined}>
                  {item.name}
                </span>
              ) : (
                <Link href={item.href} className="page-breadcrumbs__link">
                  {item.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
