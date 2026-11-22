'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import { CitataLogoWave } from '@/components/home/CitataLogoWave'

const MOBILE_MQ = '(max-width: 960px)'

const headerNavItems = [
  { href: '/works', label: 'КЕЙСЫ' },
  { href: '/services', label: 'УСЛУГИ' },
  { href: '/about', label: 'ЦИТАТА' },
  { href: '/articles', label: 'НОВОСТИ' },
  { href: '/contacts', label: 'КОНТАКТЫ' },
] as const

const menuNavItems = [
  { href: '/works', label: 'Кейсы' },
  { href: '/services', label: 'Услуги' },
  { href: '/about', label: 'О нас' },
  { href: '/articles', label: 'Новости' },
  { href: '/contacts', label: 'Контакты' },
] as const

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

type SiteBarProps = {
  /** reveal — появляется после ухода hero; always — сразу виден */
  mode?: 'reveal' | 'always'
  /** Element that keeps the bar hidden while intersecting (reveal mode) */
  revealTarget?: string
  /**
   * Home: false — bar always on mobile.
   * About: true — bar reveals on mobile after hero leaves.
   */
  revealOnMobile?: boolean
  /** Mobile home: show brand wordmark centered in the bar */
  showCenterBrand?: boolean
  email?: string
  telegramUrl?: string
}

/** Compact site header + Apostrophe-style full-screen burger menu. */
export function SiteBar({
  mode = 'always',
  revealTarget = '.home-hero__inner',
  revealOnMobile = false,
  showCenterBrand = false,
  email = 'info@citata-pr.ru',
  telegramUrl = 'https://t.me/citatapr',
}: SiteBarProps) {
  const [visible, setVisible] = useState(mode === 'always')
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLElement>(null)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const prefersReducedRef = useRef(false)
  const mobileRef = useRef(false)
  const prevOpenRef = useRef(false)

  useEffect(() => {
    prefersReducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    if (mode !== 'reveal') {
      setVisible(true)
      return
    }

    const mq = window.matchMedia(MOBILE_MQ)
    const hero = document.querySelector(revealTarget)

    const sync = () => {
      mobileRef.current = mq.matches
      if (mq.matches && !revealOnMobile) {
        setVisible(true)
        return
      }
      if (!hero) {
        setVisible(mq.matches && revealOnMobile ? false : true)
        return
      }
      const rect = hero.getBoundingClientRect()
      setVisible(rect.bottom <= 8)
    }

    sync()
    mq.addEventListener('change', sync)

    if (!hero) {
      return () => mq.removeEventListener('change', sync)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (mobileRef.current && !revealOnMobile) {
          setVisible(true)
          return
        }
        const show = !entry.isIntersecting
        setVisible(show)
        if (!show) setOpen(false)
      },
      { threshold: 0, rootMargin: '-8px 0px 0px 0px' },
    )

    observer.observe(hero)
    return () => {
      observer.disconnect()
      mq.removeEventListener('change', sync)
    }
  }, [mode, revealTarget, revealOnMobile])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      if (prevOpenRef.current) {
        burgerRef.current?.focus()
      }
      prevOpenRef.current = false
      return
    }
    prevOpenRef.current = true

    const header = headerRef.current
    const menu = menuRef.current
    if (!header || !menu) return

    const getFocusables = () => {
      const nodes = [
        burgerRef.current,
        ...Array.from(menu.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)),
      ].filter((el): el is HTMLElement => Boolean(el) && el.offsetParent !== null)
      return nodes
    }

    const focusables = getFocusables()
    const firstMenuLink = focusables.find((el) => el !== burgerRef.current)
    ;(firstMenuLink ?? burgerRef.current)?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        return
      }
      if (e.key !== 'Tab') return

      const list = getFocusables()
      if (list.length === 0) return
      const first = list[0]!
      const last = list[list.length - 1]!
      const active = document.activeElement as HTMLElement | null

      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault()
          last.focus()
        }
      } else if (active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, mounted])

  useLayoutEffect(() => {
    if (!mounted || !menuRef.current || !linksRef.current) return

    const menu = menuRef.current
    const tracks = linksRef.current.querySelectorAll<HTMLElement>('.home-bar__menu-link-track')
    const reduced = prefersReducedRef.current

    tlRef.current?.kill()

    if (open) {
      if (reduced) {
        gsap.set(menu, { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)' })
        gsap.set(tracks, { yPercent: 0 })
        return
      }

      gsap.set(menu, { autoAlpha: 1, clipPath: 'inset(0% 0% 100% 0%)' })
      gsap.set(tracks, { yPercent: 110 })

      const tl = gsap.timeline()
      tl.to(
        menu,
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 0.55,
          ease: 'power3.inOut',
        },
        0,
      ).to(
        tracks,
        {
          yPercent: 0,
          duration: 0.65,
          stagger: 0.05,
          ease: 'power3.out',
        },
        0.18,
      )
      tlRef.current = tl
      return
    }

    if (reduced) {
      gsap.set(menu, { autoAlpha: 0 })
      setMounted(false)
      return
    }

    const tl = gsap.timeline({
      onComplete: () => setMounted(false),
    })
    tl.to(tracks, {
      yPercent: -110,
      duration: 0.36,
      stagger: 0.03,
      ease: 'power2.in',
    })
      .to(
        menu,
        {
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: 0.42,
          ease: 'power3.inOut',
        },
        '-=0.14',
      )
      .set(menu, { autoAlpha: 0 })

    tlRef.current = tl
  }, [open, mounted])

  useEffect(() => {
    return () => {
      tlRef.current?.kill()
    }
  }, [])

  function openMenu() {
    setMounted(true)
    setOpen(true)
  }

  function closeMenu() {
    setOpen(false)
  }

  const interactive = visible || open || mounted

  return (
    <header
      ref={headerRef}
      className={`home-bar${visible ? ' home-bar--visible' : ''}${open || mounted ? ' home-bar--menu-open' : ''}${showCenterBrand ? ' home-bar--home' : ''}`}
      aria-hidden={!interactive}
      inert={!interactive ? true : undefined}
    >
      <div className="home-bar__inner">
        <Link
          href="/"
          className="home-bar__logo"
          aria-label="ЦИТАТА — на главную"
          onClick={closeMenu}
          tabIndex={interactive ? undefined : -1}
        >
          <Image src="/images/logo-2.svg" alt="" width={26} height={38} priority />
        </Link>

        <nav className="home-bar__nav hide-mobile" aria-label="Навигация">
          {headerNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="home-bar__link"
              onClick={closeMenu}
              tabIndex={interactive ? undefined : -1}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {showCenterBrand ? (
          <Link
            href="/"
            className="home-bar__brand"
            aria-label="ЦИТАТА — на главную"
            onClick={closeMenu}
            tabIndex={interactive ? undefined : -1}
          >
            <span className="sr-only">ЦИТАТА</span>
            <CitataLogoWave className="home-bar__brand-logo" />
          </Link>
        ) : null}

        <button
          ref={burgerRef}
          type="button"
          className={`home-bar__burger${open ? ' home-bar__burger--open' : ''}`}
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
          tabIndex={interactive ? undefined : -1}
          onClick={() => (open ? closeMenu() : openMenu())}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {mounted ? (
        <div ref={menuRef} id="site-menu" className="home-bar__menu" aria-hidden={!open}>
          <nav ref={linksRef} className="home-bar__menu-nav" aria-label="Меню">
            {menuNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="home-bar__menu-link"
                onClick={closeMenu}
                tabIndex={open ? undefined : -1}
              >
                <span className="home-bar__menu-link-track">
                  <span className="home-bar__menu-link-static">{item.label}</span>
                  <span className="home-bar__menu-link-hover" aria-hidden>
                    {item.label}
                  </span>
                </span>
              </Link>
            ))}
          </nav>

          <div className="home-bar__menu-meta">
            <a
              href={`mailto:${email}`}
              className="home-bar__menu-meta-link"
              onClick={closeMenu}
              tabIndex={open ? undefined : -1}
            >
              {email}
            </a>
            <a
              href={telegramUrl}
              className="home-bar__menu-meta-link"
              target="_blank"
              rel="noreferrer"
              onClick={closeMenu}
              tabIndex={open ? undefined : -1}
            >
              Telegram ↗
            </a>
          </div>
        </div>
      ) : null}
    </header>
  )
}
