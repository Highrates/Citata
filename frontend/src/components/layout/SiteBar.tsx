'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'

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
  { href: '/articles', label: 'Блог' },
  { href: '/contacts', label: 'Контакты' },
  { href: '/vacancies', label: 'Вакансии' },
] as const

type SiteBarProps = {
  /** reveal — появляется после ухода hero (главная); always — сразу виден */
  mode?: 'reveal' | 'always'
}

/** Compact site header + Apostrophe-style full-screen burger menu. */
export function SiteBar({ mode = 'always' }: SiteBarProps) {
  const [visible, setVisible] = useState(mode === 'always')
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const prefersReducedRef = useRef(false)

  useEffect(() => {
    prefersReducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    if (mode !== 'reveal') {
      setVisible(true)
      return
    }

    const hero = document.querySelector('.home-hero__inner')
    if (!hero) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const show = !entry.isIntersecting
        setVisible(show)
        if (!show) setOpen(false)
      },
      { threshold: 0, rootMargin: '-8px 0px 0px 0px' },
    )

    observer.observe(hero)
    return () => observer.disconnect()
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
    const items = linksRef.current.querySelectorAll<HTMLElement>('.home-bar__menu-link')
    const reduced = prefersReducedRef.current

    tlRef.current?.kill()

    if (open) {
      if (reduced) {
        gsap.set(menu, { autoAlpha: 1, clipPath: 'inset(0 0 0% 0)' })
        gsap.set(items, { yPercent: 0, autoAlpha: 1 })
        return
      }

      gsap.set(menu, { autoAlpha: 1 })
      gsap.set(items, { yPercent: 110, autoAlpha: 1 })

      const tl = gsap.timeline()
      tl.fromTo(
        menu,
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)', duration: 0.55, ease: 'power3.inOut' },
        0,
      ).to(
        items,
        {
          yPercent: 0,
          duration: 0.7,
          stagger: 0.055,
          ease: 'power3.out',
        },
        0.18,
      )
      tlRef.current = tl
      return
    }

    // close
    if (reduced) {
      gsap.set(menu, { autoAlpha: 0 })
      setMounted(false)
      return
    }

    const tl = gsap.timeline({
      onComplete: () => setMounted(false),
    })
    tl.to(items, {
      yPercent: -110,
      duration: 0.4,
      stagger: 0.035,
      ease: 'power2.in',
    })
      .to(
        menu,
        {
          clipPath: 'inset(0 0 100% 0)',
          duration: 0.45,
          ease: 'power3.inOut',
        },
        '-=0.12',
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

        <nav className="home-bar__nav" aria-label="Навигация">
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
        </div>
      ) : null}
    </header>
  )
}
