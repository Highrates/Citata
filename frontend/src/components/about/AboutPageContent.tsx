'use client'

import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { CitataBrandBlock } from '@/components/layout/CitataBrandBlock'
import type { CaseGalleryItem, SiteSettings } from '@/content/types'

type AboutPageContentProps = {
  aboutText: string
  infoEmail: string
  telegramChannelUrl: string
  aboutStats: SiteSettings['aboutStats']
  images: CaseGalleryItem[]
}

const BURST_MS = 90
const BURST_DURATION_MS = 4000
const HOLD_MS = 4000

export function AboutPageContent({
  aboutText,
  infoEmail,
  telegramChannelUrl,
  aboutStats,
  images,
}: AboutPageContentProps) {
  const router = useRouter()
  const rootRef = useRef<HTMLElement>(null)
  const curtainLeftRef = useRef<HTMLSpanElement>(null)
  const curtainRightRef = useRef<HTMLSpanElement>(null)
  const enterTlRef = useRef<gsap.core.Timeline | null>(null)
  const leavingRef = useRef(false)
  const frames =
    images.length > 0
      ? images
      : [{ src: '/images/about/portrait.jpg', alt: 'ЦИТАТА — PR-агентство', kind: 'image' as const }]
  const frameCount = frames.length
  const [activeIndex, setActiveIndex] = useState(0)
  const [introDone, setIntroDone] = useState(false)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const curtainLeft = curtainLeftRef.current
    const curtainRight = curtainRightRef.current

    if (prefersReducedMotion) {
      root.classList.add('about-split--booted')
      if (curtainLeft && curtainRight) {
        gsap.set(curtainLeft, { xPercent: -100 })
        gsap.set(curtainRight, { xPercent: 100 })
      }
      setIntroDone(true)
      return
    }

    root.classList.add('about-split--booted')

    const ctx = gsap.context(() => {
      const description = root.querySelector('.about-description')
      const media = root.querySelector('.about-split__media')
      const back = root.querySelector('.about-split__back')
      const text = root.querySelector('.about-description__text')
      const numbers = root.querySelectorAll('.about-numbers__item')
      const overlay = root.querySelector('.about-split__brand-overlay')
      const imageStack = root.querySelector('.about-split__image-stack')

      gsap.set(description, { xPercent: -14, autoAlpha: 0 })
      gsap.set(media, { autoAlpha: 1 })
      gsap.set(imageStack, { scale: 1.06 })
      gsap.set(back, { autoAlpha: 0, x: -18 })
      gsap.set(text, { autoAlpha: 0, y: 32 })
      gsap.set(numbers, { autoAlpha: 0, y: 40 })
      gsap.set(overlay, { autoAlpha: 0, y: 24, scale: 0.96 })
      if (curtainLeft && curtainRight) {
        gsap.set(curtainLeft, { xPercent: 0 })
        gsap.set(curtainRight, { xPercent: 0 })
      }

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => setIntroDone(true),
      })

      tl.to(description, { xPercent: 0, autoAlpha: 1, duration: 1.05 }, 0)
        .to(imageStack, { scale: 1, duration: 1.35, ease: 'power2.out' }, 0.08)
      if (curtainLeft && curtainRight) {
        tl.to(curtainLeft, { xPercent: -100, duration: 0.75, ease: 'power3.inOut' }, 0.2)
        tl.to(curtainRight, { xPercent: 100, duration: 0.75, ease: 'power3.inOut' }, 0.2)
      }
      tl.to(back, { autoAlpha: 1, x: 0, duration: 0.55 }, 0.32)
        .to(text, { autoAlpha: 1, y: 0, duration: 0.75 }, 0.42)
        .to(numbers, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.09 }, 0.52)
        .to(overlay, { autoAlpha: 1, y: 0, scale: 1, duration: 0.85 }, 0.48)

      enterTlRef.current = tl
    }, root)

    return () => {
      enterTlRef.current = null
      ctx.revert()
    }
  }, [])

  useEffect(() => {
    if (!introDone || frameCount < 2 || leavingRef.current) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let index = 0

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, ms)
      })

    const run = async () => {
      while (!cancelled && !leavingRef.current) {
        const burstUntil = Date.now() + BURST_DURATION_MS
        while (Date.now() < burstUntil) {
          if (cancelled || leavingRef.current) return
          index = (index + 1) % frameCount
          setActiveIndex(index)
          await wait(BURST_MS)
        }
        if (cancelled || leavingRef.current) return
        await wait(HOLD_MS)
      }
    }

    void run()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [frameCount, introDone])

  function playExit(href: string) {
    if (leavingRef.current) return
    leavingRef.current = true

    const root = rootRef.current
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!root || prefersReducedMotion) {
      router.push(href)
      return
    }

    root.classList.add('is-leaving')
    enterTlRef.current?.kill()

    const description = root.querySelector('.about-description')
    const media = root.querySelector('.about-split__media')
    const back = root.querySelector('.about-split__back')
    const text = root.querySelector('.about-description__text')
    const numbers = root.querySelectorAll('.about-numbers__item')
    const overlay = root.querySelector('.about-split__brand-overlay')
    const imageStack = root.querySelector('.about-split__image-stack')
    const curtainLeft = curtainLeftRef.current
    const curtainRight = curtainRightRef.current

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: () => router.push(href),
    })

    tl.to(overlay, { autoAlpha: 0, y: -16, scale: 0.97, duration: 0.35 }, 0)
      .to(numbers, { autoAlpha: 0, y: -22, duration: 0.32, stagger: 0.04 }, 0.02)
      .to(text, { autoAlpha: 0, y: -14, duration: 0.3 }, 0.06)
      .to(back, { autoAlpha: 0, x: -12, duration: 0.25 }, 0.06)
    if (curtainLeft && curtainRight) {
      tl.to(curtainLeft, { xPercent: 0, duration: 0.4, ease: 'power3.in' }, 0.12)
      tl.to(curtainRight, { xPercent: 0, duration: 0.4, ease: 'power3.in' }, 0.12)
    }
    tl.to(imageStack, { scale: 1.05, duration: 0.55 }, 0.18)
      .to(description, { xPercent: -12, autoAlpha: 0, duration: 0.55 }, 0.2)
      .to(media, { autoAlpha: 0, duration: 0.45 }, 0.28)
  }

  function onBackClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    playExit('/')
  }

  return (
    <section ref={rootRef} className="about-split" aria-labelledby="about-description-heading">
      <div className="about-description">
        <div className="about-description__main">
          <h1 id="about-description-heading" className="sr-only">
            О нас — ЦИТАТА
          </h1>

          <Link href="/" className="about-split__back" aria-label="На главную" onClick={onBackClick}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M19 12H5M11 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          <p className="about-description__text">{aboutText}</p>
        </div>

        <div className="about-numbers" aria-label="Цифры">
          <div className="about-numbers__item about-numbers__item--years">
            <div className="about-numbers__row">
              <p className="about-numbers__value">{aboutStats.years}</p>
              <div className="about-numbers__aside">
                <p className="about-numbers__unit">лет</p>
                <p className="about-numbers__label">Помогаем стать известнее</p>
              </div>
            </div>
          </div>

          <div className="about-numbers__item about-numbers__item--brands">
            <div className="about-numbers__row">
              <p className="about-numbers__value">+{aboutStats.brands}</p>
              <p className="about-numbers__unit about-numbers__unit--stack">
                брендов
                <br />
                &amp; экспертов
              </p>
            </div>
          </div>

          <div className="about-numbers__item about-numbers__item--reach">
            <div className="about-numbers__row">
              <p className="about-numbers__value">{aboutStats.reachMillions}*</p>
              <div className="about-numbers__aside">
                <p className="about-numbers__unit">млн</p>
                <p className="about-numbers__label">
                  человек узнают о наших клиентах ежемесячно и могут узнать о вас
                </p>
              </div>
            </div>
            <div className="about-numbers__divider" aria-hidden />
            <p className="about-numbers__note">*суммарный охват изданий, с которыми работаем</p>
          </div>
        </div>
      </div>

      <div className="about-split__media">
        <div className="about-split__image-stack" aria-hidden={frames.length > 1}>
          {frames.map((frame, index) => (
            <Image
              key={`${frame.src}-${index}`}
              src={frame.src}
              alt={index === activeIndex ? frame.alt || 'ЦИТАТА — PR-агентство' : ''}
              fill
              priority={index === 0}
              sizes="(max-width: 960px) 100vw, 50vw"
              className={`about-split__image${index === activeIndex ? ' is-active' : ''}`}
            />
          ))}
        </div>
        <span
          ref={curtainLeftRef}
          className="about-split__curtain about-split__curtain--left"
          aria-hidden="true"
        />
        <span
          ref={curtainRightRef}
          className="about-split__curtain about-split__curtain--right"
          aria-hidden="true"
        />
        <div className="about-split__brand-overlay">
          <CitataBrandBlock
            telegramUrl={telegramChannelUrl}
            email={infoEmail}
            className="preloader__inner about-split__preloader-block"
          />
        </div>
      </div>
    </section>
  )
}
