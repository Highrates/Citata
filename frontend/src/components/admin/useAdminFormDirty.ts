'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useTransition } from 'react'

/** Dirty leave guards: beforeunload + confirm for in-app navigation. */
export function useAdminFormDirty(dirty: boolean) {
  const router = useRouter()
  const allowLeaveRef = useRef(false)
  const [isNavigatingAway, startNavigate] = useTransition()

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty || allowLeaveRef.current) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  function allowLeave() {
    allowLeaveRef.current = true
  }

  function blockLeave() {
    allowLeaveRef.current = false
  }

  function confirmLeave() {
    if (!dirty) return true
    return window.confirm('Есть несохранённые изменения. Уйти без сохранения?')
  }

  function navigateAway(href: string) {
    if (!confirmLeave()) return
    allowLeave()
    startNavigate(() => {
      router.push(href)
    })
  }

  return {
    dirty,
    isNavigatingAway,
    allowLeave,
    blockLeave,
    navigateAway,
  }
}
