'use client'

import { useEffect, useRef, useState } from 'react'
import {
  homeOrderConflictMessage,
  parseHomeOrder,
  type HomeOrderCheckResult,
  type HomeOrderKind,
} from '@/lib/admin/home-order'

type CheckFn = (
  order: number,
  kind: HomeOrderKind,
  excludeSlug?: string,
) => Promise<HomeOrderCheckResult>

/** Debounced cross-collection homeOrder conflict check. */
export function useHomeOrderCheck(opts: {
  enabled: boolean
  orderRaw: string
  kind: HomeOrderKind
  excludeSlug?: string
  check: CheckFn
  debounceMs?: number
}) {
  const { enabled, orderRaw, kind, excludeSlug, check, debounceMs = 280 } = opts
  const [result, setResult] = useState<HomeOrderCheckResult | null>(null)
  const [checking, setChecking] = useState(false)
  const seqRef = useRef(0)

  useEffect(() => {
    if (!enabled) {
      setResult(null)
      setChecking(false)
      return
    }

    const order = parseHomeOrder(orderRaw)
    if (order == null) {
      setResult(null)
      setChecking(false)
      return
    }

    const seq = ++seqRef.current
    setChecking(true)
    const handle = window.setTimeout(() => {
      void check(order, kind, excludeSlug).then((next) => {
        if (seq !== seqRef.current) return
        setResult(next)
        setChecking(false)
      }).catch(() => {
        if (seq !== seqRef.current) return
        setResult(null)
        setChecking(false)
      })
    }, debounceMs)

    return () => window.clearTimeout(handle)
  }, [enabled, orderRaw, kind, excludeSlug, check, debounceMs])

  const warning =
    enabled && result && !result.available && result.conflict
      ? homeOrderConflictMessage(result.conflict)
      : null

  return { checking, result, warning, taken: Boolean(warning) }
}
