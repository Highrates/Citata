import type { SiteSettings } from './types'

export function validateSiteSettings(settings: SiteSettings): string[] {
  const errors: string[] = []
  if (!settings.tagline?.trim()) errors.push('tagline обязателен')
  if (!settings.agencyTitle?.trim()) errors.push('agencyTitle обязателен')
  if (!settings.heroTitle?.trim()) errors.push('heroTitle обязателен')
  if (!settings.assets?.logo?.trim()) errors.push('assets.logo обязателен')
  if (!Array.isArray(settings.mainServices)) errors.push('mainServices обязателен')
  if (!Array.isArray(settings.extraServices)) errors.push('extraServices обязателен')
  return errors
}
