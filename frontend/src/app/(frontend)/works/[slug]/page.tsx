import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CaseBlocks } from '@/components/cases/CaseBlocks'
import { CaseCard } from '@/components/cases/CaseCard'
import { FadeIn } from '@/components/animations/FadeIn'
import { PageGallery } from '@/components/media/PageGallery'
import { cases as fixtureCases } from '@/content/cases'
import { getCases } from '@/lib/content'
import { fetchCaseBySlug, fetchCases } from '@/lib/content-cases'
import { isVideoMedia } from '@/lib/media-kind'
import { isCasePreviewAuthorized } from '@/lib/preview'
import { ensureVideoAutoplay } from '@/lib/ensure-video-autoplay'
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

function otherCases(all: Case[], slug: string, limit = 3): Case[] {
  return all.filter((c) => c.slug !== slug).slice(0, limit)
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const sp = await searchParams
  const preview = await isCasePreviewAuthorized(sp.preview, slug)
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
  const preview = await isCasePreviewAuthorized(sp.preview, slug)
  const item = await fetchCaseBySlug(slug, { preview })
  if (!item) notFound()

  const all = await fetchCases()
  const related = otherCases(all, slug, 3)
  const { lead, dek } = caseOutcome(item)

  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Главная', url: absoluteUrl('/') },
    { name: 'Работы', url: absoluteUrl('/works') },
    { name: item.title, url: absoluteUrl(`/works/${slug}`) },
  ])

  const fixture = fixtureCases.find((c) => c.slug === slug)
  const gallery =
    item.gallery && item.gallery.length > 1 ? item.gallery : fixture?.gallery ?? item.gallery
  const coverKind = isVideoMedia(item.cover, gallery?.[0]?.kind) ? 'video' : 'image'
  const galleryRest = (gallery ?? []).slice(1)
  const status = item.status ?? 'published'
  const fixtureBlocks =
    !item.description && !item.blocks?.length ? fixture?.blocks : undefined
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
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  preload="auto"
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
            <h1 className="case-page__brand">
              {/[.!?…]$/u.test(item.title.trim()) ? item.title : `${item.title}.`}
            </h1>
            {lead ? <p className="case-page__lead">{lead}</p> : null}
            {dek ? <p className="case-page__dek">{dek}</p> : null}
          </FadeIn>
        </header>

        {item.description ? (
          <div
            className="case-page__body case-rich-html"
            dangerouslySetInnerHTML={{ __html: ensureVideoAutoplay(item.description) }}
          />
        ) : bodyBlocks?.length ? (
          <div className="case-page__body">
            <CaseBlocks blocks={bodyBlocks} />
          </div>
        ) : null}

        {galleryRest.length > 0 ? <PageGallery frames={galleryRest} label="Галерея" /> : null}

        {related.length > 0 ? (
          <section className="case-page__related" aria-labelledby="case-related-heading">
            <h2 id="case-related-heading" className="case-page__section-label">
              Другие кейсы
            </h2>
            <div className="case-page__related-grid">
              {related.map((relatedCase) => (
                <CaseCard key={relatedCase.slug} item={relatedCase} />
              ))}
            </div>
          </section>
        ) : null}

        <footer className="case-page__footer">
          <Link href="/works" className="case-page__back">
            ← Все работы
          </Link>
        </footer>
      </div>
    </article>
  )
}
