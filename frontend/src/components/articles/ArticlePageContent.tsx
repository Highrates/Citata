'use client'

import { useLayoutEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import { ArticleBody } from '@/components/articles/ArticleBody'
import { BlogRow } from '@/components/articles/BlogRow'
import { ConsultationCta } from '@/components/ui/ConsultationCta'
import type { Article } from '@/content/types'
import { formatArticleDateRu, formatReadingTimeRu } from '@/lib/reading-time'

type ArticlePageContentProps = {
  item: Article
  related: Article[]
  telegramBotUrl: string
  arrowSrc: string
}

export function ArticlePageContent({
  item,
  related,
  telegramBotUrl,
  arrowSrc,
}: ArticlePageContentProps) {
  const rootRef = useRef<HTMLElement>(null)
  const curtainLeftRef = useRef<HTMLSpanElement>(null)
  const curtainRightRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    if (!rootRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (curtainLeftRef.current && curtainRightRef.current) {
        gsap.set(curtainLeftRef.current, { xPercent: -100 })
        gsap.set(curtainRightRef.current, { xPercent: 100 })
      }
      return
    }

    const left = curtainLeftRef.current
    const right = curtainRightRef.current

    const ctx = gsap.context(() => {
      gsap.set('.article-page__meta, .article-page__title, .article-page__lead', {
        y: 28,
        opacity: 0,
      })
      gsap.set('.article-page__body, .article-page__author, .article-page__related', {
        y: 24,
        opacity: 0,
      })
      if (left && right) {
        gsap.set(left, { xPercent: 0 })
        gsap.set(right, { xPercent: 0 })
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.to('.article-page__meta', { y: 0, opacity: 1, duration: 0.55 }, 0)
        .to('.article-page__title', { y: 0, opacity: 1, duration: 0.75 }, 0.08)
        .to('.article-page__lead', { y: 0, opacity: 1, duration: 0.7 }, 0.18)

      if (left && right) {
        tl.to(left, { xPercent: -100, duration: 0.7, ease: 'power3.inOut' }, 0.28)
        tl.to(right, { xPercent: 100, duration: 0.7, ease: 'power3.inOut' }, 0.28)
      }

      tl.to('.article-page__body', { y: 0, opacity: 1, duration: 0.7 }, 0.55)
        .to('.article-page__author', { y: 0, opacity: 1, duration: 0.6 }, 0.7)
        .to('.article-page__related', { y: 0, opacity: 1, duration: 0.65 }, 0.82)
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <article ref={rootRef} className="article-page">
      <header className="article-page__header">
        <p className="article-page__meta">
          {[formatArticleDateRu(item.publishedAt), formatReadingTimeRu(item.readingTime)]
            .filter(Boolean)
            .join(' · ')}
        </p>
        <h1 className="article-page__title">{item.title}</h1>
        {item.excerpt ? <p className="article-page__lead">{item.excerpt}</p> : null}
      </header>

      {item.cover ? (
        <div className="article-page__cover">
          <div className="article-page__cover-frame">
            {item.gallery?.[0]?.kind === 'video' || /\.(mp4|webm|mov)(\?|$)/i.test(item.cover) ? (
              <video
                className="article-page__cover-img"
                src={item.cover}
                muted
                playsInline
                autoPlay
                loop
                preload="metadata"
                aria-label={item.coverAlt || item.title}
              />
            ) : (
              // Native img: keep uploaded aspect ratio (next/Image fill forces a box).
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="article-page__cover-img"
                src={item.cover}
                alt={item.coverAlt || item.title}
                decoding="async"
                fetchPriority="high"
              />
            )}
            <span
              ref={curtainLeftRef}
              className="article-page__curtain article-page__curtain--left"
              aria-hidden="true"
            />
            <span
              ref={curtainRightRef}
              className="article-page__curtain article-page__curtain--right"
              aria-hidden="true"
            />
          </div>
        </div>
      ) : null}

      <div className="article-page__body">
        <ArticleBody sections={item.sections} description={item.description} />
      </div>

      {item.author.name ? (
        <div className="article-page__author">
          {item.author.photo ? (
            <span className="article-page__author-avatar">
              <Image src={item.author.photo} alt="" width={72} height={72} />
            </span>
          ) : null}
          <div>
            <p className="article-page__author-name">{item.author.name}</p>
            {item.author.role ? <p className="article-page__author-role">{item.author.role}</p> : null}
          </div>
        </div>
      ) : null}

      {related.length > 0 ? (
        <div className="article-page__related">
          <p className="article-page__related-label">Ещё статьи</p>
          <div className="blog-page__list">
            {related.map((relatedItem) => (
              <BlogRow key={relatedItem.slug} item={relatedItem} />
            ))}
          </div>
          <p className="article-page__back">
            <Link href="/articles">← Все статьи</Link>
          </p>
        </div>
      ) : (
        <p className="article-page__back">
          <Link href="/articles">← Все статьи</Link>
        </p>
      )}

      <ConsultationCta href={telegramBotUrl} arrowSrc={arrowSrc} variant="light" />
    </article>
  )
}
