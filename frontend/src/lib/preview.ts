import 'server-only'

/** Authorize `/works/{slug}?preview=` — matches REVALIDATE_SECRET, or `1` in development. */
export function isCasePreviewAuthorized(preview: string | string[] | undefined): boolean {
  const value = Array.isArray(preview) ? preview[0] : preview
  if (!value) return false

  const secret = process.env.REVALIDATE_SECRET
  if (secret && value === secret) return true

  if (process.env.NODE_ENV === 'development' && (value === '1' || value === 'true')) {
    return true
  }

  return false
}

export function casePreviewQueryValue(): string | null {
  const secret = process.env.REVALIDATE_SECRET
  if (secret) return secret
  if (process.env.NODE_ENV === 'development') return '1'
  return null
}
