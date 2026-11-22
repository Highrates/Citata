import type { Service, SiteSettings } from '@/content/types'
import type { Media, SiteSetting } from '@/payload-types'
import { siteSettings as fixtureSiteSettings } from '@/content/site'
import { resolveMediaUrl } from '@/lib/media-url'
import { slugify } from '@/lib/slugify'

type AssetKey = keyof SiteSettings['assets']

function resolveAsset(
  media: number | Media | null | undefined,
  fallback: string,
): string {
  return resolveMediaUrl(media) ?? fallback
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
    contacts: (doc.contacts ?? fallback.contacts).map((contact) => ({
      name: contact.name,
      role: contact.role ?? '',
      email: contact.email ?? '',
    })),
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
