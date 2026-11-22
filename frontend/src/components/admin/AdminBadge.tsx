type AdminBadgeProps = {
  children: React.ReactNode
  variant?: 'on' | 'off' | 'draft' | 'warn'
}

export function AdminBadge({ children, variant = 'on' }: AdminBadgeProps) {
  return <span className={`admin-badge admin-badge--${variant}`}>{children}</span>
}
