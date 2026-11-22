'use client'

import { useEffect } from 'react'

type AdminModalProps = {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
  wide?: boolean
}

export function AdminModal({ open, title, onClose, children, footer, wide }: AdminModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="admin-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className={`admin-modal${wide ? ' admin-modal--wide' : ''}`}
        role="dialog"
        aria-labelledby="admin-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="admin-modal-head">
          <h2 className="admin-modal-title" id="admin-modal-title">
            {title}
          </h2>
          <button type="button" className="admin-modal-close" aria-label="Закрыть" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="admin-modal-body">{children}</div>
        {footer ? <footer className="admin-modal-footer">{footer}</footer> : null}
      </div>
    </div>
  )
}
