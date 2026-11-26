'use client'

import { useLayoutEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import { ArticleBody } from '@/components/articles/ArticleBody'
import { BlogRow } from '@/components/articles/BlogRow'
import { CaseCard } from '@/components/cases/CaseCard'
import {
  PageBreadcrumbs,
  type BreadcrumbItem,
} from '@/components/layout/PageBreadcrumbs'
import { PageGallery } from '@/components/media/PageGallery'
import { ConsultationCta } from '@/components/ui/ConsultationCta'
import type { Article, Case } from '@/content/types'
import { isVideoMedia } from '@/lib/media-kind'
import { formatArticleDateRu, formatReadingTimeRu } from '@/lib/reading-time'

type ArticlePageContentProps = {
  item: Article
  related: Article[]
  telegramBotUrl: string
  arrowSrc: string
  breadcrumbs?: BreadcrumbItem[]
  /** List/detail base path for related rows («Статьи» or «События»). */
  relatedHrefPrefix?: string
  relatedLabel?: string
  allLabel?: string
  allHref?: string
  /** Materials / linked cases — rendered before Telegram CTA. */
  linkedCases?: Case[]
  linkedCasesLabel?: string
}

export function ArticlePageContent({
  item,
  related,
  telegramBotUrl,
  arrowSrc,
  breadcrumbs,
  relatedHrefPrefix = '/articles',
  relatedLabel = 'Ещё статьи',
  allLabel = '← Все статьи',
  allHref = '/articles',
  linkedCases = [],
  linkedCasesLabel = 'Материалы',
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
      gsap.set(
        '.article-page__body, .article-page__author, .article-page__materials, .article-page__related',
        {
          y: 24,
          opacity: 0,
        },
      )
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
        .to('.article-page__materials', { y: 0, opacity: 1, duration: 0.6 }, 0.78)
        .to('.article-page__related', { y: 0, opacity: 1, duration: 0.65 }, 0.9)
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <article ref={rootRef} className="article-page">
      <header className="article-page__header">
        {breadcrumbs?.length ? (
          <PageBreadcrumbs className="page-breadcrumbs--in-header" items={breadcrumbs} />
        ) : null}
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
            {isVideoMedia(item.cover, item.gallery?.[0]?.kind) ? (
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

      {item.gallery && item.gallery.length > 1 ? (
        <PageGallery frames={item.gallery.slice(1)} label="Галерея" />
      ) : null}

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

      {linkedCases.length > 0 ? (
        <section
          className="container article-page__materials case-page__related"
          aria-labelledby="article-materials-heading"
        >
          <h2 id="article-materials-heading" className="case-page__section-label">
            {linkedCasesLabel}
          </h2>
          <div className="case-page__related-grid">
            {linkedCases.map((caseItem) => (
              <CaseCard
                key={caseItem.slug}
                item={caseItem}
                showYear={false}
                naturalMedia
              />
            ))}
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="container article-page__related" aria-labelledby="article-related-heading">
          <h2 id="article-related-heading" className="case-page__section-label">
            {relatedLabel}
          </h2>
          <div className="blog-page__list">
            {related.map((relatedItem) => (
              <BlogRow
                key={relatedItem.slug}
                item={relatedItem}
                hrefPrefix={relatedHrefPrefix}
              />
            ))}
          </div>
          <p className="article-page__back">
            <Link href={allHref}>{allLabel}</Link>
          </p>
        </section>
      ) : (
        <p className="article-page__back article-page__back--padded">
          <Link href={allHref}>{allLabel}</Link>
        </p>
      )}

      <ConsultationCta href={telegramBotUrl} arrowSrc={arrowSrc} variant="light" />
    </article>
  )
}
