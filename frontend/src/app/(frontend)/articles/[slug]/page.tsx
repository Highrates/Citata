import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticlePageContent } from '@/components/articles/ArticlePageContent'
import { getArticles } from '@/lib/content'
import { fetchArticleBySlug, fetchArticles } from '@/lib/content-articles'
import { fetchSiteSettings } from '@/lib/content-site'
import { absoluteUrl, articleJsonLd, breadcrumbJsonLd } from '@/lib/seo'

export const revalidate = 300

export function generateStaticParams() {
  return getArticles().map((item) => ({ slug: item.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = await fetchArticleBySlug(slug)
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
  const [item, all, settings] = await Promise.all([
    fetchArticleBySlug(slug),
    fetchArticles(),
    fetchSiteSettings(),
  ])
  if (!item) notFound()

  const related = all.filter((article) => article.slug !== item.slug).slice(0, 4)
  const url = absoluteUrl(`/articles/${slug}`)
  const jsonLd = articleJsonLd({
    title: item.title,
    description: item.excerpt,
    url,
    datePublished: item.publishedAt,
    authorName: item.author.name,
    imageUrl: item.cover,
  })
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Главная', url: absoluteUrl('/') },
    { name: 'Блог', url: absoluteUrl('/articles') },
    { name: item.title, url },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <ArticlePageContent
        item={item}
        related={related}
        telegramBotUrl={settings.telegramBotUrl}
        arrowSrc={settings.assets.arrow}
      />
    </>
  )
}
