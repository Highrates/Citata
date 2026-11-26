import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticlePageContent } from '@/components/articles/ArticlePageContent'
import { getEvents } from '@/lib/content'
import { fetchCasesBySlugs } from '@/lib/content-cases'
import { fetchEventBySlug, fetchEvents } from '@/lib/content-events'
import { fetchSiteSettings } from '@/lib/content-site'
import { isEventPreviewAuthorized } from '@/lib/preview'
import { pickRelatedEvents } from '@/lib/related-content'
import { absoluteUrl, breadcrumbJsonLd, newsArticleJsonLd } from '@/lib/seo'

export const revalidate = 300

export async function generateStaticParams() {
  const fixtureSlugs = getEvents().map((item) => item.slug)
  let cmsSlugs: string[] = []
  try {
    cmsSlugs = (await fetchEvents()).map((item) => item.slug)
  } catch {
    // Build without Payload API — fixtures only
  }
  return [...new Set([...fixtureSlugs, ...cmsSlugs])].map((slug) => ({ slug }))
}

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string }>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const sp = await searchParams
  const preview = await isEventPreviewAuthorized(sp.preview, slug)
  const item = await fetchEventBySlug(slug, { preview })
  if (!item) return {}

  return {
    title: item.seo?.title || item.title,
    description: item.seo?.description || item.excerpt,
    alternates: { canonical: absoluteUrl(`/events/${slug}`) },
    robots: preview ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      title: item.title,
      description: item.excerpt,
      publishedTime: item.publishedAt,
      images: item.cover ? [{ url: item.cover }] : undefined,
    },
  }
}

export default async function EventPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const preview = await isEventPreviewAuthorized(sp.preview, slug)
  const [item, all, settings] = await Promise.all([
    fetchEventBySlug(slug, { preview }),
    fetchEvents(),
    fetchSiteSettings(),
  ])
  if (!item) notFound()

  const related = pickRelatedEvents(all, item, 4)
  const linkedCases = await fetchCasesBySlugs((item.cases ?? []).map((c) => c.slug))

  const url = absoluteUrl(`/events/${slug}`)
  const jsonLd = newsArticleJsonLd({
    title: item.title,
    description: item.excerpt,
    url,
    datePublished: item.publishedAt,
    authorName: item.author.name,
    imageUrl: item.cover,
  })
  const crumbItems = [
    { name: 'Главная', url: absoluteUrl('/') },
    { name: 'События', url: absoluteUrl('/events') },
    { name: item.title, url },
  ]
  const status = item.status ?? 'published'

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbItems)) }}
      />
      {preview ? (
        <p className="case-preview-banner case-preview-banner--inset" role="status">
          Превью
          {status !== 'published' ? ' · черновик' : null}
          {' · '}
          не индексируется
        </p>
      ) : null}
      <ArticlePageContent
        item={item}
        related={related}
        telegramBotUrl={settings.telegramBotUrl}
        arrowSrc={settings.assets.arrow}
        breadcrumbs={[
          { name: 'Главная', href: '/' },
          { name: 'События', href: '/events' },
          { name: item.title },
        ]}
        relatedHrefPrefix="/events"
        relatedLabel="Ещё события"
        allLabel="← Все события"
        allHref="/events"
        linkedCases={linkedCases}
        linkedCasesLabel="Материалы"
      />
    </>
  )
}
