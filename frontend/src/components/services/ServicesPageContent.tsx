'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import type { Service } from '@/content/types'

const LOGO_SRC = '/images/logo-2.svg'

const SLOGAN_ROWS = [
  [
    { text: 'ДУМАЕМ.', weight: 'bold' as const },
    { text: 'СОЗДАЕМ.', weight: 'bold' as const },
  ],
  [
    { text: 'ЗАПУСКАЕМ.', weight: 'light' as const },
    { text: 'ПОВТОРЯЕМ', weight: 'bold' as const },
  ],
] as const

type ServicesPageContentProps = {
  services: Service[]
  defaultImage: string
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function ServicesPageContent({ services, defaultImage }: ServicesPageContentProps) {
  const rootRef = useRef<HTMLElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const curtainLeftRef = useRef<HTMLSpanElement>(null)
  const curtainRightRef = useRef<HTMLSpanElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const introDoneRef = useRef(false)
  const animatedIndexRef = useRef(0)
  const curtainTweenRef = useRef<gsap.core.Timeline | null>(null)

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [previewY, setPreviewY] = useState(0)

  const activeIndex = hoveredIndex ?? focusedIndex
  const active = services[activeIndex] ?? services[0]
  const previewSrc = active?.image || defaultImage
  const previewAlt = active?.coverAlt || active?.title || ''

  const [displaySrc, setDisplaySrc] = useState(previewSrc)
  const [displayAlt, setDisplayAlt] = useState(previewAlt)

  const syncPreviewPosition = () => {
    const body = bodyRef.current
    const preview = previewRef.current
    const item = itemRefs.current[activeIndex]
    if (!body || !preview || !item) return
    if (window.matchMedia('(max-width: 991px)').matches) {
      setPreviewY(0)
      return
    }

    const bodyRect = body.getBoundingClientRect()
    const itemRect = item.getBoundingClientRect()
    const previewH = preview.offsetHeight
    const itemCenter = itemRect.top - bodyRect.top + itemRect.height / 2
    const maxY = Math.max(0, body.offsetHeight - previewH)
    const nextY = Math.min(Math.max(0, itemCenter - previewH / 2), maxY)
    setPreviewY(nextY)
  }

  useLayoutEffect(() => {
    syncPreviewPosition()
  }, [activeIndex, services, displaySrc])

  useEffect(() => {
    const onResize = () => syncPreviewPosition()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [activeIndex, services, displaySrc])

  // Page intro — slower accelerating stagger
  useLayoutEffect(() => {
    if (!rootRef.current) return

    const left = curtainLeftRef.current
    const right = curtainRightRef.current
    const items = rootRef.current.querySelectorAll('.services-board__item')
    const marks = rootRef.current.querySelectorAll('.services-board__mark')
    const slogan = rootRef.current.querySelector('.services-board__slogan')

    introDoneRef.current = false

    if (prefersReducedMotion()) {
      gsap.set(left, { xPercent: -100 })
      gsap.set(right, { xPercent: 100 })
      introDoneRef.current = true
      return
    }

    gsap.set(slogan, { y: 28, opacity: 0 })
    gsap.set(marks, { opacity: 0, y: 12 })
    gsap.set(items, { y: 140, opacity: 0 })
    gsap.set(left, { xPercent: 0 })
    gsap.set(right, { xPercent: 0 })

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          introDoneRef.current = true
        },
      })

      tl.to(slogan, { y: 0, opacity: 1, duration: 0.75 }, 0)
      tl.to(marks, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0.15)
      tl.to(
        items,
        {
          y: 0,
          opacity: 1,
          duration: 1.15,
          ease: 'power3.out',
          stagger: { amount: 4.8, from: 'start', ease: 'power2.in' },
        },
        0.4,
      )
      tl.to(left, { xPercent: -100, duration: 0.85, ease: 'power3.inOut' }, 1.1)
      tl.to(right, { xPercent: 100, duration: 0.85, ease: 'power3.inOut' }, 1.1)
    }, rootRef)

    return () => {
      introDoneRef.current = false
      ctx.revert()
    }
  }, [])

  // Curtain on active index change — do NOT depend on displaySrc (that killed the open tween)
  useEffect(() => {
    if (activeIndex === animatedIndexRef.current && introDoneRef.current) return

    const left = curtainLeftRef.current
    const right = curtainRightRef.current
    const nextSrc = previewSrc
    const nextAlt = previewAlt
    const nextIndex = activeIndex

    if (!left || !right) {
      setDisplaySrc(nextSrc)
      setDisplayAlt(nextAlt)
      animatedIndexRef.current = nextIndex
      return
    }

    curtainTweenRef.current?.kill()

    if (!introDoneRef.current) {
      setDisplaySrc(nextSrc)
      setDisplayAlt(nextAlt)
      animatedIndexRef.current = nextIndex
      return
    }

    if (prefersReducedMotion()) {
      setDisplaySrc(nextSrc)
      setDisplayAlt(nextAlt)
      animatedIndexRef.current = nextIndex
      gsap.set(left, { xPercent: -100 })
      gsap.set(right, { xPercent: 100 })
      return
    }

    const tl = gsap.timeline({
      defaults: { overwrite: 'auto' },
      onComplete: () => {
        animatedIndexRef.current = nextIndex
      },
    })
    curtainTweenRef.current = tl

    tl.fromTo(left, { xPercent: -100 }, { xPercent: 0, duration: 0.32, ease: 'power3.in' }, 0)
    tl.fromTo(right, { xPercent: 100 }, { xPercent: 0, duration: 0.32, ease: 'power3.in' }, 0)
    tl.add(() => {
      setDisplaySrc(nextSrc)
      setDisplayAlt(nextAlt)
    })
    tl.to(left, { xPercent: -100, duration: 0.55, ease: 'power3.out' }, '+=0.06')
    tl.to(right, { xPercent: 100, duration: 0.55, ease: 'power3.out' }, '<')

    return () => {
      tl.kill()
    }
  }, [activeIndex, previewSrc, previewAlt])

  return (
    <section ref={rootRef} className="services-board" aria-labelledby="services-board-title">
      <header className="services-board__top">
        <h1 id="services-board-title" className="services-board__slogan">
          {SLOGAN_ROWS.map((row, rowIndex) => (
            <span key={rowIndex} className="services-board__slogan-row">
              {row.map((part) => (
                <span
                  key={part.text}
                  className={
                    part.weight === 'light'
                      ? 'services-board__slogan-word services-board__slogan-word--light'
                      : 'services-board__slogan-word'
                  }
                >
                  {part.text}
                </span>
              ))}
            </span>
          ))}
        </h1>

        <div className="services-board__mark services-board__mark--close" aria-hidden="true">
          <Image src={LOGO_SRC} alt="" width={72} height={96} priority />
        </div>
      </header>

      <div ref={bodyRef} className="services-board__body">
        <div className="services-board__list-wrap">
          <div className="services-board__mark services-board__mark--open" aria-hidden="true">
            <Image src={LOGO_SRC} alt="" width={120} height={160} priority />
          </div>

          <ul className="services-board__list" onMouseLeave={() => setHoveredIndex(null)}>
            {services.map((service, index) => {
              const isActive = activeIndex === index
              return (
                <li key={service.slug || `${service.title}-${index}`}>
                  <button
                    type="button"
                    ref={(el) => {
                      itemRefs.current[index] = el
                    }}
                    className={`services-board__item${isActive ? ' is-active' : ''}`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onFocus={() => setFocusedIndex(index)}
                    aria-pressed={isActive}
                  >
                    <span className="services-board__num">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="services-board__name">{service.title}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="services-board__preview-track">
          <div
            ref={previewRef}
            className="services-board__preview"
            style={{ transform: `translate3d(0, ${previewY}px, 0)` }}
          >
            <div className="services-board__preview-frame">
              {displaySrc ? (
                <Image
                  key={displaySrc}
                  src={displaySrc}
                  alt={displayAlt}
                  fill
                  sizes="(max-width: 991px) 78vw, 38vw"
                  className="services-board__preview-img"
                  priority
                />
              ) : null}
              <span
                ref={curtainLeftRef}
                className="services-board__curtain services-board__curtain--left"
                aria-hidden="true"
              />
              <span
                ref={curtainRightRef}
                className="services-board__curtain services-board__curtain--right"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
