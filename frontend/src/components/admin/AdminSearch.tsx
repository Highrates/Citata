type AdminSearchProps = {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export function AdminSearch({
  value,
  onChange,
  placeholder = 'Поиск…',
  className = '',
}: AdminSearchProps) {
  return (
    <div className={`admin-search ${className}`.trim()}>
      <svg className="admin-search-icon" width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
        <path
          d="M9.58 17.5C13.96 17.5 17.5 13.96 17.5 9.58C17.5 5.21 13.96 1.67 9.58 1.67C5.21 1.67 1.67 5.21 1.67 9.58C1.67 13.96 5.21 17.5 9.58 17.5Z"
          stroke="currentColor"
          strokeWidth="1.3"
          fill="none"
        />
        <path d="M18.33 18.33L16.67 16.67" stroke="currentColor" strokeWidth="1.3" />
      </svg>
      <input
        className="admin-search-input"
        type="search"
        placeholder={placeholder}
        aria-label="Поиск"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  )
}
