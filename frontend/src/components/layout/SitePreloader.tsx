'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { CitataBrandBlock } from '@/components/layout/CitataBrandBlock'

type SitePreloaderProps = {
  telegramUrl?: string
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | void> {
  return Promise.race([
    promise,
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, ms)
    }),
  ])
}

/**
 * Страница загрузки сайта — статичный контент, затем
 * лого вверх / контент вниз / экран гаснет opacity.
 * Не ждём полный window.load (картинки кейсов на home), иначе mobile зависает.
 */
export function SitePreloader({ telegramUrl = 'https://t.me/citatapr' }: SitePreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [done, setDone] = useState(false)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || done) return

    let cancelled = false
    let exitStarted = false
    let exitTimer: ReturnType<typeof setTimeout> | undefined
    let safetyTimer: ReturnType<typeof setTimeout> | undefined
    let exitTl: gsap.core.Timeline | undefined
    let finished = false

    document.documentElement.classList.add('is-preloading')

    const logo = root.querySelector<HTMLElement>('.preloader__logo-wrap')
    const below = root.querySelector<HTMLElement>('.preloader__below')
    const logoImg = root.querySelector<HTMLImageElement>('.preloader__logo')
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const MIN_MS = prefersReducedMotion ? 280 : 1100
    const MAX_MS = prefersReducedMotion ? 900 : 2800
    const started = performance.now()

    const waitLogo = () =>
      new Promise<void>((resolve) => {
        if (!logoImg) {
          resolve()
          return
        }
        if (logoImg.complete && logoImg.naturalWidth > 0) {
          resolve()
          return
        }
        const doneLogo = () => resolve()
        logoImg.addEventListener('load', doneLogo, { once: true })
        logoImg.addEventListener('error', doneLogo, { once: true })
      })

    const waitFonts = () =>
      'fonts' in document ? document.fonts.ready.then(() => undefined) : Promise.resolve()

    const finish = () => {
      if (cancelled || finished) return
      finished = true
      document.documentElement.classList.remove('is-preloading')
      setDone(true)
    }

    const runExit = () => {
      if (cancelled || finished || exitStarted || !rootRef.current) return
      exitStarted = true
      if (safetyTimer) {
        clearTimeout(safetyTimer)
        safetyTimer = undefined
      }
      const wait = Math.max(0, MIN_MS - (performance.now() - started))

      exitTimer = setTimeout(() => {
        if (cancelled || finished || !rootRef.current) return

        if (prefersReducedMotion) {
          finish()
          return
        }

        exitTl = gsap.timeline({ onComplete: finish })

        if (logo) {
          exitTl.to(logo, { y: '-12vh', opacity: 0, duration: 0.45, ease: 'power3.in' }, 0)
        }
        if (below) {
          exitTl.to(below, { y: '12vh', opacity: 0, duration: 0.45, ease: 'power3.in' }, 0)
        }
        exitTl.to(
          rootRef.current,
          { opacity: 0, duration: 0.35, ease: 'power2.inOut' },
          '+=0.02',
        )
      }, wait)
    }

    // Soft gate: logo + fonts, each capped — never block on home case images.
    Promise.all([withTimeout(waitLogo(), 1200), withTimeout(waitFonts(), 1200)])
      .then(runExit)
      .catch(runExit)

    // Hard safety: always dismiss even if promises stall (mobile Safari / slow fonts).
    safetyTimer = setTimeout(runExit, MAX_MS)

    return () => {
      cancelled = true
      if (exitTimer) clearTimeout(exitTimer)
      if (safetyTimer) clearTimeout(safetyTimer)
      exitTl?.kill()
      gsap.killTweensOf([root, logo, below].filter(Boolean))
      document.documentElement.classList.remove('is-preloading')
    }
  }, [done])

  if (done) return null

  return (
    <div ref={rootRef} className="preloader" aria-busy="true" aria-live="polite">
      <CitataBrandBlock telegramUrl={telegramUrl} />
    </div>
  )
}
