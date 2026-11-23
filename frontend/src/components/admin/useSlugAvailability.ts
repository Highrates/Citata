'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { slugify } from '@/lib/slugify'

export type SlugCheck = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

type CheckFn = (
  slug: string,
  excludeSlug?: string,
) => Promise<{ slug: string; available: boolean }>

/** Debounced slug availability check shared by case/article editors. */
export function useSlugAvailability(opts: {
  slug: string
  slugTouched: boolean
  excludeSlug?: string
  check: CheckFn
  debounceMs?: number
}) {
  const { slug, slugTouched, excludeSlug, check, debounceMs = 320 } = opts
  const [slugCheck, setSlugCheck] = useState<SlugCheck>('idle')
  const seqRef = useRef(0)

  const runCheck = useCallback(
    async (value: string) => {
      const normalized = slugify(value)
      if (!normalized) {
        setSlugCheck('invalid')
        return
      }

      const seq = ++seqRef.current
      setSlugCheck('checking')
      try {
        const result = await check(normalized, excludeSlug)
        if (seq !== seqRef.current) return

        if (!result?.slug) {
          setSlugCheck('invalid')
          return
        }
        setSlugCheck(result.available ? 'available' : 'taken')
      } catch {
        if (seq !== seqRef.current) return
        // Don't block save on transient check failures
        setSlugCheck('idle')
      }
    },
    [check, excludeSlug],
  )

  useEffect(() => {
    if (!slugTouched && !slug) {
      setSlugCheck('idle')
      return
    }
    // Existing doc with unchanged slug — skip network check
    if (excludeSlug && slugify(slug) === excludeSlug) {
      setSlugCheck('available')
      return
    }
    const handle = window.setTimeout(() => {
      void runCheck(slug)
    }, debounceMs)
    return () => window.clearTimeout(handle)
  }, [slug, slugTouched, excludeSlug, runCheck, debounceMs])

  const resetSlugCheck = useCallback(() => setSlugCheck('idle'), [])

  const slugHint =
    slugCheck === 'checking'
      ? 'Проверка…'
      : slugCheck === 'taken'
        ? 'Slug уже занят'
        : slugCheck === 'invalid'
          ? 'Slug пуст после нормализации'
          : slugCheck === 'available'
            ? 'Slug свободен'
            : null

  return { slugCheck, slugHint, resetSlugCheck, setSlugCheck }
}
