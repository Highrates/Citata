'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { CitataBrandBlock } from '@/components/layout/CitataBrandBlock'
import type { GalleryItem } from '@/content/types'
import { dispatchPreloaderDone, dispatchPreloaderReveal } from '@/lib/preloader-events'

type SitePreloaderProps = {
  telegramUrl?: string
  email?: string
  images?: GalleryItem[]
}

const MOBILE_MQ = '(max-width: 960px)'
const FALLBACK_FRAME: GalleryItem = {
  src: '/images/about/portrait.jpg',
  alt: 'ЦИТАТА — PR-агентство',
  kind: 'image',
}

/** About-style burst; flip a bit under 3s, then curtain exit. */
const BURST_MS = 90
const MOBILE_ACTIVE_MS = 2200
const HOLD_AFTER_MS = 200

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | void> {
  return Promise.race([
    promise,
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, ms)
    }),
  ])
}

/**
 * Boot preloader once per page load.
 * Desktop: static brand block, then split exit.
 * Mobile (≤960): about-style media + brand overlay, ~3s flip, then elegant exit.
 */
export function SitePreloader({
  telegramUrl = 'https://t.me/citatapr',
  email = 'info@citata-pr.ru',
  images = [],
}: SitePreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [done, setDone] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  /** Mount media stack only on mobile so desktop boot stays light. */
  const [mobileBoot, setMobileBoot] = useState(false)
  const [bootReady, setBootReady] = useState(false)

  const frames =
    images.filter((item) => item.kind !== 'video' && item.src).length > 0
      ? images.filter((item) => item.kind !== 'video' && item.src)
      : [FALLBACK_FRAME]
  const frameCount = frames.length

  useLayoutEffect(() => {
    const mobile = window.matchMedia(MOBILE_MQ).matches
    setMobileBoot(mobile)
    setBootReady(true)
  }, [])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || done || !bootReady) return

    let cancelled = false
    let exitStarted = false
    let exitTimer: ReturnType<typeof setTimeout> | undefined
    let safetyTimer: ReturnType<typeof setTimeout> | undefined
    let burstTimer: ReturnType<typeof setTimeout> | undefined
    let exitTl: gsap.core.Timeline | undefined
    let finished = false

    document.documentElement.classList.add('is-preloading')

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = mobileBoot

    const logo = root.querySelector<HTMLElement>('.preloader__logo-wrap')
    const below = root.querySelector<HTMLElement>('.preloader__below')
    const overlay = root.querySelector<HTMLElement>('.preloader__brand-overlay')
    const stack = root.querySelector<HTMLElement>('.preloader__media-stack')
    const curtainLeft = root.querySelector<HTMLElement>('.preloader__curtain--left')
    const curtainRight = root.querySelector<HTMLElement>('.preloader__curtain--right')
    const logoImg = root.querySelector<HTMLImageElement>('.preloader__logo')
    const started = performance.now()
    const MIN_MS = prefersReducedMotion ? 280 : 1100

    if (curtainLeft && curtainRight) {
      // Off-screen while media plays; exit closes over content then reveals home
      gsap.set(curtainLeft, { xPercent: -100 })
      gsap.set(curtainRight, { xPercent: 100 })
    }

    const finish = () => {
      if (cancelled || finished) return
      finished = true
      dispatchPreloaderDone()
      setDone(true)
    }

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

    const runDesktopExit = () => {
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
        exitTl
          .add(() => {
            dispatchPreloaderReveal()
          }, 0.2)
          .to(
            rootRef.current,
            { opacity: 0, duration: 0.35, ease: 'power2.inOut' },
            '+=0.02',
          )
      }, wait)
    }

    const runMobileExit = () => {
      if (cancelled || finished || exitStarted || !rootRef.current) return
      exitStarted = true
      if (safetyTimer) {
        clearTimeout(safetyTimer)
        safetyTimer = undefined
      }

      exitTimer = setTimeout(() => {
        if (cancelled || finished || !rootRef.current) return
        if (prefersReducedMotion) {
          finish()
          return
        }

        // Curtain exit: brand fades → шторки закрывают → сразу home (без открытия шторок)
        exitTl = gsap.timeline({ onComplete: finish })
        if (overlay) {
          exitTl.to(
            overlay,
            { autoAlpha: 0, y: -12, duration: 0.3, ease: 'power2.in' },
            0,
          )
        }
        if (stack) {
          exitTl.to(stack, { scale: 1.04, duration: 0.55, ease: 'power2.inOut' }, 0.06)
        }
        if (curtainLeft && curtainRight) {
          exitTl
            .to(
              curtainLeft,
              { xPercent: 0, duration: 0.65, ease: 'power3.inOut' },
              0.18,
            )
            .to(
              curtainRight,
              { xPercent: 0, duration: 0.65, ease: 'power3.inOut' },
              0.18,
            )
            .add(() => {
              // Unlock home CSS opacity, start intro, then drop preloader (curtains already --bg)
              document.documentElement.classList.remove('is-preloading')
              dispatchPreloaderReveal()
            })
            .set(rootRef.current, { autoAlpha: 0 })
        } else {
          exitTl
            .add(() => {
              document.documentElement.classList.remove('is-preloading')
              dispatchPreloaderReveal()
            }, 0.2)
            .to(
              rootRef.current,
              { autoAlpha: 0, duration: 0.4, ease: 'power2.inOut' },
              0.22,
            )
        }
      }, HOLD_AFTER_MS)
    }

    if (!mobile) {
      const MAX_MS = prefersReducedMotion ? 900 : 2800
      Promise.all([withTimeout(waitLogo(), 1200), withTimeout(waitFonts(), 1200)])
        .then(runDesktopExit)
        .catch(runDesktopExit)
      safetyTimer = setTimeout(runDesktopExit, MAX_MS)

      return () => {
        cancelled = true
        if (exitTimer) clearTimeout(exitTimer)
        if (safetyTimer) clearTimeout(safetyTimer)
        exitTl?.kill()
        gsap.killTweensOf([root, logo, below].filter(Boolean))
        if (!finished) dispatchPreloaderDone()
      }
    }

    const runBurstThenExit = async () => {
      const wait = (ms: number) =>
        new Promise<void>((resolve) => {
          burstTimer = setTimeout(resolve, ms)
        })

      const endAt = started + MOBILE_ACTIVE_MS

      if (prefersReducedMotion || frameCount < 2) {
        const rem = Math.max(0, endAt - performance.now())
        await wait(rem)
        if (cancelled || finished) return
        runMobileExit()
        return
      }

      let index = 0
      while (performance.now() < endAt) {
        if (cancelled || finished) return
        index = (index + 1) % frameCount
        setActiveIndex(index)
        await wait(BURST_MS)
      }

      if (cancelled || finished) return
      runMobileExit()
    }

    // Short soft gate — remaining time up to 3s is the flip burst
    void Promise.all([withTimeout(waitLogo(), 400), withTimeout(waitFonts(), 400)])
      .then(() => runBurstThenExit())
      .catch(() => runBurstThenExit())

    safetyTimer = setTimeout(runMobileExit, prefersReducedMotion ? 900 : 3200)

    return () => {
      cancelled = true
      if (exitTimer) clearTimeout(exitTimer)
      if (safetyTimer) clearTimeout(safetyTimer)
      if (burstTimer) clearTimeout(burstTimer)
      exitTl?.kill()
      gsap.killTweensOf(
        [root, overlay, stack, curtainLeft, curtainRight].filter(Boolean),
      )
      if (!finished) dispatchPreloaderDone()
    }
  }, [done, frameCount, bootReady, mobileBoot])

  if (done) return null

  return (
    <div ref={rootRef} className="preloader" aria-busy="true" aria-live="polite" aria-label="Загрузка">
      {mobileBoot ? (
        <div className="preloader__media-stack" aria-hidden={frameCount > 1}>
          {frames.map((frame, index) => (
            // eslint-disable-next-line @next/next/no-img-element -- boot stack; avoid next/image preload on desktop
            <img
              key={`${frame.src}-${index}`}
              src={frame.src}
              alt={index === activeIndex ? frame.alt || 'ЦИТАТА' : ''}
              className={`preloader__media-image${index === activeIndex ? ' is-active' : ''}`}
              loading={index < 4 ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={index === 0 ? 'high' : 'low'}
            />
          ))}
        </div>
      ) : null}
      <div className="preloader__brand-overlay">
        <CitataBrandBlock
          telegramUrl={telegramUrl}
          email={email}
          className="preloader__inner preloader__inner--boot"
        />
      </div>
      {mobileBoot ? (
        <>
          <span className="preloader__curtain preloader__curtain--left" aria-hidden="true" />
          <span className="preloader__curtain preloader__curtain--right" aria-hidden="true" />
        </>
      ) : null}
    </div>
  )
}
