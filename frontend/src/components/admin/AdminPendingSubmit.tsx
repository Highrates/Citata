'use client'

import { useFormStatus } from 'react-dom'

type AdminPendingSubmitProps = {
  disabled?: boolean
  idleLabel?: string
  pendingLabel?: string
  className?: string
}

/** Submit button with pending label via useFormStatus (must be inside a form). */
export function AdminPendingSubmit({
  disabled,
  idleLabel = 'Сохранить',
  pendingLabel = 'Сохранение…',
  className = 'admin-btn admin-btn--accent',
}: AdminPendingSubmitProps) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className={className} disabled={disabled || pending}>
      {pending ? pendingLabel : idleLabel}
    </button>
  )
}
