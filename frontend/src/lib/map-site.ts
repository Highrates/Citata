import type { GalleryItem, Service, SiteSettings } from '@/content/types'
import type { Media, SiteSetting } from '@/payload-types'
import { siteSettings as fixtureSiteSettings } from '@/content/site'
import { resolveMediaAlt, resolveMediaUrl } from '@/lib/media-url'
import { slugify } from '@/lib/slugify'

type AssetKey = keyof SiteSettings['assets']

function resolveAsset(
  media: number | Media | null | undefined,
  fallback: string,
): string {
  return resolveMediaUrl(media) ?? fallback
}

function mediaKind(media: number | Media | null | undefined): 'image' | 'video' {
  if (!media || typeof media === 'number') return 'image'
  const mime = media.mimeType ?? ''
  if (mime.startsWith('video/')) return 'video'
  const url = media.url ?? media.filename ?? ''
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return 'video'
  return 'image'
}

function mapAboutGallery(doc: SiteSetting): GalleryItem[] {
  if (doc.aboutGallery == null) return fixtureSiteSettings.aboutGallery

  const items: GalleryItem[] = []
  for (const row of doc.aboutGallery) {
    const src = resolveMediaUrl(row.media)
    if (!src) continue
    items.push({
      src,
      alt: resolveMediaAlt(row.media, 'О нас'),
      kind: mediaKind(row.media),
    })
  }
  return items
}

function mapServices(
  items: SiteSetting['mainServices'] | SiteSetting['extraServices'] | null | undefined,
  fallback: Service[],
): Service[] {
  if (!items?.length) return fallback
  return items.map((item, index) => {
    const title = item.title
    const match = fallback.find((f) => f.title === title)
    return {
      title,
      slug: match?.slug || slugify(title),
      sortOrder: match?.sortOrder ?? index + 1,
      ...(item.description ? { description: item.description } : {}),
    }
  })
}

export function mapPayloadSiteSettingsToSiteSettings(doc: SiteSetting): SiteSettings {
  const fallback = fixtureSiteSettings

  const assetsGroup = doc.assets
  const assets: SiteSettings['assets'] = {
    logo: resolveAsset(assetsGroup?.logo, fallback.assets.logo),
    logoFooter: resolveAsset(assetsGroup?.logoFooter, fallback.assets.logoFooter),
    arrow: resolveAsset(assetsGroup?.arrow, fallback.assets.arrow),
    comma: resolveAsset(assetsGroup?.comma, fallback.assets.comma),
    prHero: resolveAsset(assetsGroup?.prHero, fallback.assets.prHero),
    tgIcon: resolveAsset(assetsGroup?.tgIcon, fallback.assets.tgIcon),
  }

  return {
    tagline: doc.tagline ?? fallback.tagline,
    agencyTitle: doc.agencyTitle ?? fallback.agencyTitle,
    heroTitle: doc.heroTitle ?? fallback.heroTitle,
    heroSubtitle: doc.heroSubtitle ?? fallback.heroSubtitle,
    telegramBotUrl: doc.telegramBotUrl ?? fallback.telegramBotUrl,
    telegramChannelUrl: doc.telegramChannelUrl ?? fallback.telegramChannelUrl,
    infoEmail: doc.infoEmail ?? fallback.infoEmail,
    aboutText: doc.aboutText ?? fallback.aboutText,
    aboutStats: {
      years: doc.aboutStats?.years ?? fallback.aboutStats.years,
      brands: doc.aboutStats?.brands ?? fallback.aboutStats.brands,
      reachMillions: doc.aboutStats?.reachMillions ?? fallback.aboutStats.reachMillions,
    },
    aboutGallery: mapAboutGallery(doc),
    contacts: (doc.contacts ?? fallback.contacts).map((contact) => {
      const fallbackContact = fallback.contacts.find(
        (item) => item.email && item.email === contact.email,
      )
      return {
        name: contact.name,
        role: contact.role ?? '',
        email: contact.email ?? '',
        telegram: contact.telegram || fallbackContact?.telegram,
      }
    }),
    legal: {
      disclaimer: doc.legal?.disclaimer ?? fallback.legal.disclaimer,
      companyName: doc.legal?.companyName ?? fallback.legal.companyName,
      inn: doc.legal?.inn ?? fallback.legal.inn,
      ogrnip: doc.legal?.ogrnip ?? fallback.legal.ogrnip,
    },
    assets,
    mainServices: mapServices(doc.mainServices, fallback.mainServices),
    extraServices: mapServices(doc.extraServices, fallback.extraServices),
  }
}

export function mapSiteSettingsToPayloadData(
  settings: SiteSettings,
  assetIds?: Partial<Record<AssetKey, number>>,
  aboutGalleryMediaIds?: number[],
) {
  return {
    tagline: settings.tagline,
    agencyTitle: settings.agencyTitle,
    heroTitle: settings.heroTitle,
    heroSubtitle: settings.heroSubtitle,
    aboutText: settings.aboutText,
    telegramBotUrl: settings.telegramBotUrl,
    telegramChannelUrl: settings.telegramChannelUrl,
    infoEmail: settings.infoEmail,
    aboutStats: settings.aboutStats,
    aboutGallery: aboutGalleryMediaIds?.map((media) => ({ media })),
    contacts: settings.contacts,
    legal: settings.legal,
    mainServices: settings.mainServices.map(({ title, description }) => ({
      title,
      ...(description ? { description } : {}),
    })),
    extraServices: settings.extraServices.map(({ title, description }) => ({
      title,
      ...(description ? { description } : {}),
    })),
    assets: assetIds
      ? {
          logo: assetIds.logo,
          logoFooter: assetIds.logoFooter,
          arrow: assetIds.arrow,
          comma: assetIds.comma,
          prHero: assetIds.prHero,
          tgIcon: assetIds.tgIcon,
        }
      : undefined,
  }
}

export function resolveAboutGalleryMediaIds(doc: SiteSetting): number[] {
  const ids: number[] = []
  for (const row of doc.aboutGallery ?? []) {
    const media = row.media
    if (typeof media === 'number') ids.push(media)
    else if (media && typeof media === 'object' && typeof media.id === 'number') ids.push(media.id)
  }
  return ids
}
