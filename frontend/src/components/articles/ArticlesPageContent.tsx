'use client'

import { useLayoutEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { BlogRow } from '@/components/articles/BlogRow'
import type { Article, PressMention } from '@/content/types'

type ArticlesPageContentProps = {
  articles: Article[]
  press: PressMention[]
}

export function ArticlesPageContent({ articles, press }: ArticlesPageContentProps) {
  const rootRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (!rootRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.from('.blog-page__heading > *', {
        y: 28,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
      })
      gsap.from('.blog-row', {
        y: 56,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.out',
        stagger: { amount: 1.6, from: 'start', ease: 'power2.in' },
        delay: 0.15,
      })
      gsap.from('.blog-press', {
        y: 36,
        opacity: 0,
        duration: 0.75,
        ease: 'power3.out',
        delay: 0.55,
      })
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="blog-page">
      <header className="blog-page__heading">
        <h1 className="blog-page__title">Блог.</h1>
        <p className="blog-page__subtitle">Здесь пишем мы</p>
      </header>

      <div className="blog-page__list">
        {articles.map((item) => (
          <BlogRow key={item.slug} item={item} />
        ))}
      </div>

      {press.length > 0 ? (
        <div className="blog-press">
          <h2 className="blog-press__title">Здесь пишут о нас</h2>
          <div className="blog-press__grid">
            {press.map((item) => (
              <a
                key={item.url}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="blog-press__card"
              >
                {item.logo ? (
                  <span className="blog-press__logo">
                    <Image src={item.logo} alt="" width={120} height={48} className="blog-press__logo-img" />
                  </span>
                ) : null}
                <span className="blog-press__card-title">{item.title}</span>
                <span className="blog-press__card-meta">
                  {item.source}
                  <span className="blog-press__read">читать</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
