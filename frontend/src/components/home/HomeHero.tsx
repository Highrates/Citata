'use client'

import { useLayoutEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { CitataLogoWave } from '@/components/home/CitataLogoWave'
import { HomeCasesGrid, type MediaGridItem } from '@/components/home/HomeCasesGrid'
import { HomeScrollHeader } from '@/components/home/HomeScrollHeader'
import { waitForPreloaderReveal } from '@/lib/preloader-events'

const services = [
  'Пиар',
  'Стратегия',
  'SMM',
  'Дизайн',
  'Брендинг',
  'Web/App разработка',
] as const

const navItems = [
  { href: '/about', label: 'Мы' },
  { href: '/works', label: 'Кейсы' },
  { href: '/services', label: 'Услуги' },
  { href: '/events', label: 'События' },
  { href: '/contacts', label: 'Контакты' },
] as const

type HomeHeroProps = {
  email: string
  telegramUrl: string
  cases: MediaGridItem[]
}

export function HomeHero({ email, telegramUrl, cases }: HomeHeroProps) {
  const rootRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (!rootRef.current) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia('(max-width: 960px)').matches
    const brand = rootRef.current.querySelector<HTMLElement>('.home-hero__brand')
    const menu = rootRef.current.querySelector<HTMLElement>('.home-hero__menu')
    const letters = rootRef.current.querySelectorAll<HTMLElement>('.logo-wave__letter')
    const cols = rootRef.current.querySelectorAll<HTMLElement>('.home-hero__col')
    const grid = rootRef.current.querySelector<HTMLElement>('.home-cases-grid')
    if (!menu) return

    let cancelled = false
    const ctx = gsap.context(() => {
      const showInstant = () => {
        if (brand) gsap.set(brand, { height: 'auto', overflow: 'visible' })
        gsap.set(letters, { y: 0 })
        gsap.set(cols, { opacity: 1, y: 0 })
        if (grid) gsap.set(grid, { opacity: 1, y: 0 })
      }

      if (prefersReducedMotion) {
        showInstant()
        return
      }

      // Hold content hidden until preloader curtains close & reveal
      gsap.set(cols, { opacity: 0, y: isMobile ? 18 : 12 })
      if (grid) gsap.set(grid, { opacity: 0, y: isMobile ? 36 : 24 })

      const playIntro = () => {
        if (cancelled || !rootRef.current) return

        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

        if (brand && !isMobile) {
          const brandHeight = brand.scrollHeight
          const dist = Math.ceil(brandHeight * 1.4) || 120
          gsap.set(brand, { height: 0, overflow: 'hidden' })
          gsap.set(letters, { y: -dist })

          tl.to(
            brand,
            {
              height: brandHeight,
              duration: 0.9,
              ease: 'power3.out',
              onComplete: () => {
                gsap.set(brand, { height: 'auto', overflow: 'visible' })
              },
            },
            0,
          ).to(
            letters,
            {
              y: 0,
              duration: 0.7,
              stagger: 0.045,
            },
            0.06,
          )
        }

        if (isMobile) {
          // After curtains: soft rise of meta, then grid
          tl.to(
            cols,
            { opacity: 1, y: 0, duration: 0.55, stagger: 0.07, ease: 'power3.out' },
            0.05,
          )
          if (grid) {
            tl.to(
              grid,
              { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' },
              '-=0.28',
            )
          }
        } else {
          tl.to(
            cols,
            { opacity: 1, y: 0, duration: 0.45, stagger: 0.05 },
            '-=0.35',
          )
          if (grid) {
            tl.to(grid, { opacity: 1, y: 0, duration: 0.6 }, '-=0.2')
          }
        }
      }

      void waitForPreloaderReveal().then(playIntro)
    }, rootRef)

    return () => {
      cancelled = true
      ctx.revert()
    }
  }, [])

  return (
    <section ref={rootRef} className="home-hero" aria-label="ЦИТАТА">
      <HomeScrollHeader email={email} telegramUrl={telegramUrl} />

      <div className="home-hero__inner">
        <h1 className="home-hero__brand">
          <span className="sr-only">ЦИТАТА</span>
          <CitataLogoWave className="home-hero__logo" />
        </h1>

        <div className="home-hero__menu">
          <p className="home-hero__col home-hero__agency">
            <span className="home-hero__agency-line">Агентство информационных</span>
            <span className="home-hero__agency-line">технологий &amp; коммуникаций</span>
          </p>

          <ul className="home-hero__col home-hero__services" aria-label="Услуги">
            {services.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <nav className="home-hero__col home-hero__nav hide-mobile" aria-label="Навигация">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="home-hero__nav-link">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="home-hero__col home-hero__contacts">
            <a href={`mailto:${email}`} className="home-hero__contact-link">
              {email}
            </a>
            <a
              href={telegramUrl}
              className="home-hero__contact-link"
              target="_blank"
              rel="noreferrer"
            >
              Telegram <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>

      <div className="home-hero__cards">
        <HomeCasesGrid cases={cases} />
      </div>
    </section>
  )
}
