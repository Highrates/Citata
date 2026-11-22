'use client'

import { useLayoutEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { CitataLogoWave } from '@/components/home/CitataLogoWave'
import { HomeCasesGrid } from '@/components/home/HomeCasesGrid'
import { HomeScrollHeader } from '@/components/home/HomeScrollHeader'
import type { Case } from '@/content/types'

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
  { href: '/vacancies', label: 'Вакансии' },
  { href: '/contacts', label: 'Контакты' },
] as const

type HomeHeroProps = {
  email: string
  telegramUrl: string
  cases: Pick<Case, 'slug' | 'title' | 'cover' | 'coverAlt' | 'year' | 'summary'>[]
}

export function HomeHero({ email, telegramUrl, cases }: HomeHeroProps) {
  const rootRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (!rootRef.current) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const brand = rootRef.current.querySelector<HTMLElement>('.home-hero__brand')
    const menu = rootRef.current.querySelector<HTMLElement>('.home-hero__menu')
    const letters = rootRef.current.querySelectorAll<HTMLElement>('.logo-wave__letter')
    if (!brand || !menu) return

    const brandHeight = brand.scrollHeight
    const dist = Math.ceil(brandHeight * 1.4) || 120

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(brand, { height: 'auto', overflow: 'visible' })
        gsap.set(letters, { y: 0 })
        gsap.set('.home-hero__col', { opacity: 1, y: 0 })
        gsap.set('.home-cases-grid', { opacity: 1, y: 0 })
        return
      }

      gsap.set(brand, { height: 0, overflow: 'hidden' })
      gsap.set(letters, { y: -dist })
      gsap.set('.home-hero__col', { opacity: 0, y: 12 })
      gsap.set('.home-cases-grid', { opacity: 0, y: 24 })

      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        onComplete: () => {
          gsap.set(brand, { height: 'auto', overflow: 'visible' })
        },
      })

      tl.to(
        brand,
        {
          height: brandHeight,
          duration: 0.9,
          ease: 'power3.out',
        },
        0,
      )
        .to(
          letters,
          {
            y: 0,
            duration: 0.7,
            stagger: 0.045,
          },
          0.06,
        )
        .to(
          '.home-hero__col',
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.05 },
          '-=0.35',
        )
        .to('.home-cases-grid', { opacity: 1, y: 0, duration: 0.6 }, '-=0.2')
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="home-hero" aria-label="ЦИТАТА">
      <HomeScrollHeader />

      <div className="home-hero__inner">
        <h1 className="home-hero__brand">
          <span className="sr-only">ЦИТАТА</span>
          <CitataLogoWave className="home-hero__logo" />
        </h1>

        <div className="home-hero__menu">
          <p className="home-hero__col home-hero__agency">
            Агентство информационных
            <br />
            технологий & коммуникаций
          </p>

          <ul className="home-hero__col home-hero__services" aria-label="Услуги">
            {services.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <nav className="home-hero__col home-hero__nav" aria-label="Навигация">
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
