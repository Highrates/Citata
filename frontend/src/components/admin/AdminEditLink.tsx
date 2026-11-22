import Link from 'next/link'

type AdminEditLinkProps = {
  href: string
  label: string
}

/** Compact pencil icon used as the row “edit” control across admin lists. */
export function AdminEditLink({ href, label }: AdminEditLinkProps) {
  return (
    <Link href={href} className="admin-icon-btn" aria-label={label} title={label}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M11.3 2.3a1.2 1.2 0 0 1 1.7 1.7L5.8 11.2 3 12l.8-2.8 7.5-6.9Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path d="M9.8 3.5 12.5 6.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </Link>
  )
}
