import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CaseBlocks } from '@/components/cases/CaseBlocks'
import { FadeIn } from '@/components/animations/FadeIn'
import { cases as fixtureCases } from '@/content/cases'
import { getCases } from '@/lib/content'
import { fetchCaseBySlug, fetchCases } from '@/lib/content-cases'
import { isCasePreviewAuthorized } from '@/lib/preview'
import { absoluteUrl, breadcrumbJsonLd } from '@/lib/seo'
import type { Case } from '@/content/types'

export const revalidate = 300

export function generateStaticParams() {
  return getCases().map((item) => ({ slug: item.slug }))
}

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string }>
}

function normalizeLead(value?: string) {
  return (value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!?…]+$/u, '')
    .toLowerCase()
}

function caseOutcome(item: Case) {
  const hero = item.heroTitle?.trim()
  const summary = item.summary?.trim()
  if (hero && summary && normalizeLead(hero) !== normalizeLead(summary)) {
    return { lead: hero, dek: summary }
  }
  return { lead: hero || summary || '', dek: '' }
}

function nextCase(all: Case[], slug: string): Case | undefined {
  if (all.length < 2) return undefined
  const index = all.findIndex((c) => c.slug === slug)
  if (index < 0) return all[0]
  return all[(index + 1) % all.length]
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const sp = await searchParams
  const preview = isCasePreviewAuthorized(sp.preview)
  const item = await fetchCaseBySlug(slug, { preview })
  if (!item) return {}

  return {
    title: item.seo?.title || item.title,
    description: item.seo?.description || item.summary,
    alternates: { canonical: absoluteUrl(`/works/${slug}`) },
    robots: preview ? { index: false, follow: false } : undefined,
    openGraph: {
      title: item.title,
      description: item.summary,
      images: item.cover ? [{ url: item.cover }] : undefined,
    },
  }
}

export default async function CasePage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const preview = isCasePreviewAuthorized(sp.preview)
  const item = await fetchCaseBySlug(slug, { preview })
  if (!item) notFound()

  const all = await fetchCases()
  const upcoming = nextCase(all, slug)
  const { lead, dek } = caseOutcome(item)

  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Главная', url: absoluteUrl('/') },
    { name: 'Работы', url: absoluteUrl('/works') },
    { name: item.title, url: absoluteUrl(`/works/${slug}`) },
  ])

  const coverKind =
    item.gallery?.[0]?.kind ?? (/\.(mp4|webm|mov)(\?|$)/i.test(item.cover) ? 'video' : 'image')
  const galleryRest = (item.gallery ?? []).slice(1)
  const status = item.status ?? 'published'
  const fixtureBlocks =
    !item.description && !item.blocks?.length
      ? fixtureCases.find((c) => c.slug === slug)?.blocks
      : undefined
  const bodyBlocks = item.blocks?.length ? item.blocks : fixtureBlocks

  return (
    <article className="case-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <div className="case-page__inner">
        {preview ? (
          <p className="case-preview-banner" role="status">
            Превью
            {status !== 'published' ? ` · ${status === 'hidden' ? 'скрыто' : 'черновик'}` : null}
            {' · '}
            не индексируется
          </p>
        ) : null}

        {item.cover ? (
          <FadeIn>
            <figure className="case-page__cover">
              {coverKind === 'video' ? (
                <video
                  className="case-page__cover-video"
                  src={item.cover}
                  controls
                  playsInline
                  preload="metadata"
                />
              ) : (
                <Image
                  src={item.cover}
                  alt={item.coverAlt}
                  width={1600}
                  height={900}
                  className="case-page__cover-image"
                  sizes="(max-width: 1120px) 100vw, 1120px"
                  priority
                />
              )}
            </figure>
          </FadeIn>
        ) : null}

        <header className="case-page__intro">
          <FadeIn>
            <p className="case-page__meta">
              {item.year ? `${item.year} г.` : 'Кейс'}
            </p>
            <h1 className="case-page__brand">{item.title}</h1>
            {lead ? <p className="case-page__lead">{lead}</p> : null}
            {dek ? <p className="case-page__dek">{dek}</p> : null}
          </FadeIn>
        </header>

        {item.description ? (
          <div
            className="case-page__body case-rich-html"
            dangerouslySetInnerHTML={{ __html: item.description }}
          />
        ) : bodyBlocks?.length ? (
          <div className="case-page__body">
            <CaseBlocks blocks={bodyBlocks} />
          </div>
        ) : null}

        {galleryRest.length > 0 ? (
          <section className="case-page__gallery" aria-label="Галерея кейса">
            {galleryRest.map((frame) =>
              frame.kind === 'video' ? (
                <video
                  key={frame.src}
                  className="case-page__gallery-video"
                  src={frame.src}
                  controls
                  playsInline
                  preload="metadata"
                />
              ) : (
                <figure key={frame.src} className="case-page__gallery-frame">
                  <Image
                    src={frame.src}
                    alt={frame.alt}
                    width={1600}
                    height={1000}
                    className="case-page__gallery-image"
                    sizes="(max-width: 1120px) 100vw, 1120px"
                  />
                </figure>
              ),
            )}
          </section>
        ) : null}

        <footer className="case-page__footer">
          {upcoming ? (
            <Link href={`/works/${upcoming.slug}`} className="case-page__next">
              <span className="case-page__next-label">Следующий кейс</span>
              <span className="case-page__next-title">{upcoming.title}</span>
              {upcoming.summary || upcoming.heroTitle ? (
                <span className="case-page__next-summary">
                  {upcoming.summary || upcoming.heroTitle}
                </span>
              ) : null}
            </Link>
          ) : null}

          <Link href="/works" className="case-page__back">
            ← Все работы
          </Link>
        </footer>
      </div>
    </article>
  )
}
