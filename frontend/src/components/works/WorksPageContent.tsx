'use client'

import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { HomeCasesGrid, type MediaGridItem } from '@/components/home/HomeCasesGrid'

type WorksPageContentProps = {
  items: MediaGridItem[]
  label?: string
  title?: string
  /** Show page H1 visually (e.g. /articles). Default: screen-reader only. */
  showTitle?: boolean
}

/** Masonry grid with entrance animation (works / articles). */
export function WorksPageContent({
  items,
  label = 'Работы',
  title = 'Работы',
  showTitle = false,
}: WorksPageContentProps) {
  const rootRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (!rootRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      if (showTitle) {
        gsap.set('.works-page__title', { opacity: 0, y: 16 })
      }
      gsap.set('.home-cases-grid', { opacity: 0, y: 28 })
      gsap.set('.home-cases-grid__item', { opacity: 0, y: 36 })

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      if (showTitle) {
        tl.to('.works-page__title', { opacity: 1, y: 0, duration: 0.5 }, 0)
      }
      tl.to('.home-cases-grid', { opacity: 1, y: 0, duration: 0.45 }, showTitle ? 0.06 : 0).to(
        '.home-cases-grid__item',
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: { amount: 0.85, from: 'start' },
        },
        '-=0.35',
      )
    }, rootRef)

    return () => ctx.revert()
  }, [items, showTitle])

  return (
    <section ref={rootRef} className="works-page" aria-label={label}>
      <h1 className={showTitle ? 'works-page__title' : 'sr-only'}>{title}</h1>
      <div className="home-hero__cards">
        <HomeCasesGrid cases={items} label={label} />
      </div>
    </section>
  )
}
