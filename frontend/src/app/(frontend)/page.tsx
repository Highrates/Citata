import { HomeHero } from '@/components/home/HomeHero'
import type { MediaGridItem } from '@/components/home/HomeCasesGrid'
import { fetchFeaturedArticles } from '@/lib/content-articles'
import { fetchCases, fetchFeaturedCases } from '@/lib/content-cases'
import { fetchSiteSettings } from '@/lib/content-site'
import { absoluteUrl, organizationJsonLd } from '@/lib/seo'

export const revalidate = 300

function coverKindFromSrc(cover: string, galleryKind?: 'image' | 'video'): 'image' | 'video' {
  if (galleryKind === 'video' || galleryKind === 'image') return galleryKind
  return /\.(mp4|webm|mov)(\?|$)/i.test(cover) ? 'video' : 'image'
}

function toCaseItem(
  item: Awaited<ReturnType<typeof fetchCases>>[number],
): MediaGridItem & { homeOrder: number } {
  return {
    slug: item.slug,
    title: item.title,
    cover: item.cover,
    coverAlt: item.coverAlt,
    summary: item.summary,
    href: `/works/${item.slug}`,
    coverKind: coverKindFromSrc(item.cover, item.gallery?.[0]?.kind),
    homeOrder: item.homeOrder ?? Number.MAX_SAFE_INTEGER,
  }
}

function toArticleItem(
  item: Awaited<ReturnType<typeof fetchFeaturedArticles>>[number],
): (MediaGridItem & { homeOrder: number }) | null {
  if (!item.cover) return null
  return {
    slug: item.slug,
    title: item.title,
    cover: item.cover,
    coverAlt: item.coverAlt || item.title,
    href: `/articles/${item.slug}`,
    homeOrder: item.homeOrder ?? Number.MAX_SAFE_INTEGER,
  }
}

function byHomeOrder(
  a: { homeOrder: number; title: string },
  b: { homeOrder: number; title: string },
) {
  if (a.homeOrder !== b.homeOrder) return a.homeOrder - b.homeOrder
  return a.title.localeCompare(b.title, 'ru')
}

export default async function HomePage() {
  const settings = await fetchSiteSettings()
  const [allCases, featuredCases, featuredArticles] = await Promise.all([
    fetchCases(),
    fetchFeaturedCases(),
    fetchFeaturedArticles(),
  ])

  const featuredGrid = [
    ...featuredCases.map(toCaseItem),
    ...featuredArticles.map(toArticleItem).filter((item): item is NonNullable<typeof item> => Boolean(item)),
  ].sort(byHomeOrder)

  // Fallback: no featured homepage slots → published cases by works list order
  const gridItems: MediaGridItem[] = featuredGrid.length
    ? featuredGrid.map(({ homeOrder: _homeOrder, ...item }) => item)
    : allCases.map((item) => {
        const mapped = toCaseItem(item)
        const { homeOrder: _homeOrder, ...rest } = mapped
        return rest
      })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
      />

      <HomeHero
        email={settings.infoEmail || 'info@citata-pr.ru'}
        telegramUrl={settings.telegramChannelUrl}
        cases={gridItems}
      />

      <link rel="canonical" href={absoluteUrl('/')} />
    </>
  )
}
