'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'

const MOBILE_MQ = '(max-width: 960px)'

const headerNavItems = [
  { href: '/works', label: 'КЕЙСЫ' },
  { href: '/services', label: 'УСЛУГИ' },
  { href: '/about', label: 'ЦИТАТА' },
  { href: '/contacts', label: 'КОНТАКТЫ' },
] as const

const menuNavItems = [
  { href: '/works', label: 'Кейсы' },
  { href: '/services', label: 'Услуги' },
  { href: '/about', label: 'О нас' },
  { href: '/articles', label: 'Новости' },
  { href: '/contacts', label: 'Контакты' },
] as const

type SiteBarProps = {
  /** reveal — появляется после ухода hero (главная, desktop); always — сразу виден */
  mode?: 'reveal' | 'always'
  email?: string
  telegramUrl?: string
}

/** Compact site header + Apostrophe-style full-screen burger menu. */
export function SiteBar({
  mode = 'always',
  email = 'info@citata-pr.ru',
  telegramUrl = 'https://t.me/citatapr',
}: SiteBarProps) {
  const [visible, setVisible] = useState(mode === 'always')
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const prefersReducedRef = useRef(false)
  const mobileRef = useRef(false)

  useEffect(() => {
    prefersReducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    if (mode !== 'reveal') {
      setVisible(true)
      return
    }

    const mq = window.matchMedia(MOBILE_MQ)
    const hero = document.querySelector('.home-hero__inner')

    const sync = () => {
      mobileRef.current = mq.matches
      if (mq.matches) {
        setVisible(true)
        return
      }
      if (!hero) {
        setVisible(true)
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
        if (mobileRef.current) {
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
  }, [mode])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

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

  return (
    <header
      className={`home-bar${visible ? ' home-bar--visible' : ''}${open || mounted ? ' home-bar--menu-open' : ''}`}
      aria-hidden={!visible}
    >
      <div className="home-bar__inner">
        <Link
          href="/"
          className="home-bar__logo"
          aria-label="ЦИТАТА — на главную"
          onClick={closeMenu}
        >
          <Image src="/images/logo-2.svg" alt="" width={26} height={38} priority />
        </Link>

        <nav className="home-bar__nav hide-mobile" aria-label="Навигация">
          {headerNavItems.map((item) => (
            <Link key={item.href} href={item.href} className="home-bar__link" onClick={closeMenu}>
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className={`home-bar__burger${open ? ' home-bar__burger--open' : ''}`}
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
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
            <a href={`mailto:${email}`} className="home-bar__menu-meta-link" onClick={closeMenu}>
              {email}
            </a>
            <a
              href={telegramUrl}
              className="home-bar__menu-meta-link"
              target="_blank"
              rel="noreferrer"
              onClick={closeMenu}
            >
              Telegram ↗
            </a>
          </div>
        </div>
      ) : null}
    </header>
  )
}
