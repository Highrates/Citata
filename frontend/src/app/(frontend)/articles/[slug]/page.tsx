import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { ArticlePageContent } from '@/components/articles/ArticlePageContent'
import { getArticles } from '@/lib/content'
import { fetchArticleBySlug, fetchArticles } from '@/lib/content-articles'
import { fetchEventBySlug } from '@/lib/content-events'
import { fetchSiteSettings } from '@/lib/content-site'
import { pickRelatedArticles } from '@/lib/related-content'
import { absoluteUrl, articleJsonLd, breadcrumbJsonLd } from '@/lib/seo'

export const revalidate = 300

export function generateStaticParams() {
  return getArticles().map((item) => ({ slug: item.slug }))
}

type Props = { params: Promise<{ slug: string }> }

async function redirectIfMigratedEvent(slug: string) {
  const item = await fetchArticleBySlug(slug)
  if (item) return item
  const migratedEvent = await fetchEventBySlug(slug)
  if (migratedEvent) {
    permanentRedirect(`/events/${slug}`)
  }
  return undefined
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = await redirectIfMigratedEvent(slug)
  if (!item) return {}

  return {
    title: item.seo?.title || item.title,
    description: item.seo?.description || item.excerpt,
    alternates: { canonical: absoluteUrl(`/articles/${slug}`) },
    openGraph: {
      type: 'article',
      title: item.title,
      description: item.excerpt,
      publishedTime: item.publishedAt,
      images: item.cover ? [{ url: item.cover }] : undefined,
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const item = await redirectIfMigratedEvent(slug)
  if (!item) notFound()

  const [all, settings] = await Promise.all([fetchArticles(), fetchSiteSettings()])
  const related = pickRelatedArticles(all, item, 4)
  const url = absoluteUrl(`/articles/${slug}`)
  const jsonLd = articleJsonLd({
    title: item.title,
    description: item.excerpt,
    url,
    datePublished: item.publishedAt,
    authorName: item.author.name,
    imageUrl: item.cover,
  })
  const crumbItems = [
    { name: 'Главная', url: absoluteUrl('/') },
    { name: 'Статьи', url: absoluteUrl('/articles') },
    { name: item.title, url },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbItems)) }}
      />
      <ArticlePageContent
        item={item}
        related={related}
        telegramBotUrl={settings.telegramBotUrl}
        arrowSrc={settings.assets.arrow}
        breadcrumbs={[
          { name: 'Главная', href: '/' },
          { name: 'Статьи', href: '/articles' },
          { name: item.title },
        ]}
      />
    </>
  )
}
