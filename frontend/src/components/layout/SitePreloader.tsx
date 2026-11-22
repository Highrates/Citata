'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { CitataBrandBlock } from '@/components/layout/CitataBrandBlock'

type SitePreloaderProps = {
  telegramUrl?: string
}

/**
 * Страница загрузки сайта — статичный контент, затем
 * лого вверх / контент вниз / экран гаснет opacity.
 */
export function SitePreloader({ telegramUrl = 'https://t.me/citatapr' }: SitePreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [done, setDone] = useState(false)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || done) return

    let cancelled = false
    let exitTimer: ReturnType<typeof setTimeout> | undefined
    let exitTl: gsap.core.Timeline | undefined

    document.documentElement.classList.add('is-preloading')

    const logo = root.querySelector<HTMLElement>('.preloader__logo-wrap')
    const below = root.querySelector<HTMLElement>('.preloader__below')
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const MIN_MS = prefersReducedMotion ? 300 : 1400
    const started = performance.now()

    const whenReady = () =>
      Promise.all([
        new Promise<void>((resolve) => {
          if (document.readyState === 'complete') resolve()
          else window.addEventListener('load', () => resolve(), { once: true })
        }),
        'fonts' in document ? document.fonts.ready.then(() => undefined) : Promise.resolve(),
      ])

    const finish = () => {
      if (cancelled) return
      document.documentElement.classList.remove('is-preloading')
      setDone(true)
    }

    const runExit = () => {
      if (cancelled || !rootRef.current) return
      const wait = Math.max(0, MIN_MS - (performance.now() - started))

      exitTimer = setTimeout(() => {
        if (cancelled || !rootRef.current) return

        if (prefersReducedMotion) {
          finish()
          return
        }

        exitTl = gsap.timeline({ onComplete: finish })

        if (logo) {
          exitTl.to(logo, { y: -100, opacity: 0, duration: 0.5, ease: 'power3.in' }, 0)
        }
        if (below) {
          exitTl.to(below, { y: 100, opacity: 0, duration: 0.5, ease: 'power3.in' }, 0)
        }
        exitTl.to(
          rootRef.current,
          { opacity: 0, duration: 0.4, ease: 'power2.inOut' },
          '+=0.04',
        )
      }, wait)
    }

    whenReady().then(runExit).catch(runExit)

    return () => {
      cancelled = true
      if (exitTimer) clearTimeout(exitTimer)
      exitTl?.kill()
      gsap.killTweensOf([root, logo, below].filter(Boolean))
    }
  }, [done])

  if (done) return null

  return (
    <div ref={rootRef} className="preloader" aria-busy="true" aria-live="polite">
      <CitataBrandBlock telegramUrl={telegramUrl} />
    </div>
  )
}
