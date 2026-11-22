import { HomeHero } from '@/components/home/HomeHero'
import { fetchCases, fetchFeaturedCases } from '@/lib/content-cases'
import { fetchSiteSettings } from '@/lib/content-site'
import { absoluteUrl, organizationJsonLd } from '@/lib/seo'

export const revalidate = 300

export default async function HomePage() {
  const settings = await fetchSiteSettings()
  const allCases = await fetchCases()
  const featured = await fetchFeaturedCases()
  const pool = (featured.length ? featured : allCases).map(
    ({ slug, title, cover, coverAlt, year, summary }) => ({
      slug,
      title,
      cover,
      coverAlt,
      year,
      summary,
    }),
  )
  // Dense masonry needs more cells than we currently have — tile the pool
  const targetCount = Math.max(28, pool.length)
  const featuredCases = Array.from({ length: targetCount }, (_, i) => pool[i % pool.length]!)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
      />

      <HomeHero
        email={settings.infoEmail || 'info@citata-pr.ru'}
        telegramUrl={settings.telegramChannelUrl}
        cases={featuredCases}
      />

      <link rel="canonical" href={absoluteUrl('/')} />
    </>
  )
}
