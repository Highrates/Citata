import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BlogRow } from '@/components/articles/BlogRow'
import { CaseBlocks } from '@/components/cases/CaseBlocks'
import { CaseCard } from '@/components/cases/CaseCard'
import { FadeIn } from '@/components/animations/FadeIn'
import { PageBreadcrumbs } from '@/components/layout/PageBreadcrumbs'
import { PageGallery } from '@/components/media/PageGallery'
import { ConsultationCta } from '@/components/ui/ConsultationCta'
import { cases as fixtureCases } from '@/content/cases'
import { getCases } from '@/lib/content'
import { fetchCaseBySlug, fetchCases } from '@/lib/content-cases'
import { fetchEventsForCase } from '@/lib/content-events'
import { fetchSiteSettings } from '@/lib/content-site'
import { isVideoMedia } from '@/lib/media-kind'
import { isCasePreviewAuthorized } from '@/lib/preview'
import { ensureVideoAutoplay } from '@/lib/ensure-video-autoplay'
import { pickRelatedCases } from '@/lib/related-content'
import { absoluteUrl, breadcrumbJsonLd, creativeWorkJsonLd } from '@/lib/seo'
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
      type: 'article',
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
  const [item, all, settings] = await Promise.all([
    fetchCaseBySlug(slug, { preview }),
    fetchCases(),
    fetchSiteSettings(),
  ])
  if (!item) notFound()

  const relatedEvents = await fetchEventsForCase(slug)
  const related = pickRelatedCases(all, item, relatedEvents, 3)
  const { lead, dek } = caseOutcome(item)

  const url = absoluteUrl(`/works/${slug}`)
  const crumbItems = [
    { name: 'Главная', url: absoluteUrl('/') },
    { name: 'Работы', url: absoluteUrl('/works') },
    { name: item.title, url },
  ]
  const workJsonLd = creativeWorkJsonLd({
    title: item.title,
    description: item.summary || item.seo?.description,
    url,
    imageUrl: item.cover,
    datePublished: item.year ? `${item.year}-01-01` : undefined,
  })

  const fixture = fixtureCases.find((c) => c.slug === slug)
  const gallery =
    item.gallery && item.gallery.length > 1 ? item.gallery : fixture?.gallery ?? item.gallery
  const coverKind = isVideoMedia(item.cover, gallery?.[0]?.kind) ? 'video' : 'image'
  const galleryRest = (gallery ?? []).slice(1)
  const status = item.status ?? 'published'
  const fixtureBlocks =
    !item.description && !item.blocks?.length ? fixture?.blocks : undefined
  const bodyBlocks = item.blocks?.length ? item.blocks : fixtureBlocks
  const titleText = /[.!?…]$/u.test(item.title.trim()) ? item.title : `${item.title}.`

  return (
    <article className="case-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(workJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbItems)) }}
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

        <header className="case-page__intro">
          <PageBreadcrumbs
            className="page-breadcrumbs--in-header"
            items={[
              { name: 'Главная', href: '/' },
              { name: 'Работы', href: '/works' },
              { name: item.title },
            ]}
          />
          <FadeIn>
            <h1 className="case-page__title">{titleText}</h1>
            {lead ? <p className="case-page__lead">{lead}</p> : null}
            {dek ? <p className="case-page__dek">{dek}</p> : null}
          </FadeIn>
        </header>

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
                  preload="metadata"
                  aria-label={item.coverAlt || item.title}
                />
              ) : (
                // Native img: keep uploaded aspect ratio (like event cover)
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="case-page__cover-image"
                  src={item.cover}
                  alt={item.coverAlt || item.title}
                  decoding="async"
                  fetchPriority="high"
                />
              )}
            </figure>
          </FadeIn>
        ) : null}

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

        {relatedEvents.length > 0 ? (
          <section className="case-page__related" aria-labelledby="case-events-heading">
            <h2 id="case-events-heading" className="case-page__section-label">
              События
            </h2>
            <div className="blog-page__list">
              {relatedEvents.map((eventItem) => (
                <BlogRow key={eventItem.slug} item={eventItem} hrefPrefix="/events" />
              ))}
            </div>
          </section>
        ) : null}

        {related.length > 0 ? (
          <section className="case-page__related" aria-labelledby="case-related-heading">
            <h2 id="case-related-heading" className="case-page__section-label">
              Другие кейсы
            </h2>
            <div className="case-page__related-grid">
              {related.map((relatedCase) => (
                <CaseCard
                  key={relatedCase.slug}
                  item={relatedCase}
                  showYear={false}
                  naturalMedia
                />
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

      {settings.telegramBotUrl ? (
        <ConsultationCta
          href={settings.telegramBotUrl}
          arrowSrc={settings.assets.arrow}
          variant="light"
        />
      ) : null}
    </article>
  )
}
