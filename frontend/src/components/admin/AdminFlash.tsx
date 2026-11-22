'use client'

import { useEffect, useState } from 'react'
import type { AdminDataSource } from '@/lib/admin/data'

type AdminFlashProps = {
  saved?: boolean
  error?: string
}

/** Flash banner: aria-live, dismissible, strips ?saved/?error from the URL. */
export function AdminFlash({ saved, error }: AdminFlashProps) {
  const [visibleSaved, setVisibleSaved] = useState(Boolean(saved))
  const [visibleError, setVisibleError] = useState(error ?? '')

  useEffect(() => {
    setVisibleSaved(Boolean(saved))
    setVisibleError(error ?? '')
  }, [saved, error])

  useEffect(() => {
    if (!saved && !error) return
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    if (!url.searchParams.has('saved') && !url.searchParams.has('error')) return
    url.searchParams.delete('saved')
    url.searchParams.delete('error')
    const next = `${url.pathname}${url.search}${url.hash}`
    window.history.replaceState(window.history.state, '', next)
  }, [saved, error])

  function dismiss() {
    setVisibleSaved(false)
    setVisibleError('')
  }

  if (visibleSaved) {
    return (
      <div className="admin-flash admin-flash--success" role="status" aria-live="polite">
        <p className="admin-success">Сохранено</p>
        <button type="button" className="admin-flash__dismiss" onClick={dismiss} aria-label="Скрыть">
          ×
        </button>
      </div>
    )
  }

  if (visibleError) {
    return (
      <div className="admin-flash admin-flash--error" role="alert" aria-live="assertive">
        <p className="admin-error">{visibleError}</p>
        <button type="button" className="admin-flash__dismiss" onClick={dismiss} aria-label="Скрыть">
          ×
        </button>
      </div>
    )
  }

  return null
}

type AdminSourceBannerProps = {
  source: AdminDataSource
}

export function AdminSourceBanner({ source }: AdminSourceBannerProps) {
  if (source === 'payload') return null
  return (
    <p className="admin-error" role="status">
      Показаны фикстуры. Настройте DATABASE_URL и выполните seed, чтобы сохранять в Payload.
    </p>
  )
}
