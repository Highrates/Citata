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

function toCaseItems(
  items: Awaited<ReturnType<typeof fetchCases>>,
): MediaGridItem[] {
  return items.map(({ slug, title, cover, coverAlt, summary, gallery }) => ({
    slug,
    title,
    cover,
    coverAlt,
    summary,
    href: `/works/${slug}`,
    coverKind: coverKindFromSrc(cover, gallery?.[0]?.kind),
  }))
}

function toArticleItems(
  items: Awaited<ReturnType<typeof fetchFeaturedArticles>>,
): MediaGridItem[] {
  return items
    .filter((item) => item.cover)
    .map(({ slug, title, cover, coverAlt }) => ({
      slug,
      title,
      cover,
      coverAlt: coverAlt || title,
      href: `/articles/${slug}`,
    }))
}

/** Alternate two pools (call with news first, then cases). */
function interleave(a: MediaGridItem[], b: MediaGridItem[]): MediaGridItem[] {
  const out: MediaGridItem[] = []
  const max = Math.max(a.length, b.length)
  for (let i = 0; i < max; i++) {
    if (a[i]) out.push(a[i]!)
    if (b[i]) out.push(b[i]!)
  }
  return out
}

export default async function HomePage() {
  const settings = await fetchSiteSettings()
  const [allCases, featuredCases, featuredArticles] = await Promise.all([
    fetchCases(),
    fetchFeaturedCases(),
    fetchFeaturedArticles(),
  ])

  const casePool = toCaseItems(featuredCases.length ? featuredCases : allCases)
  // News on home only when «Выводить на главную» is checked in admin
  const articlePool = toArticleItems(featuredArticles)
  const mixed = interleave(articlePool, casePool)
  // Unique items only — no pad-to-28 cycling (duplicate href/cover noise).
  const gridItems = mixed.length ? mixed : casePool

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
