import {
  hmacSha256Base64Url,
  verifyHmacSha256Base64Url,
} from '@/lib/crypto/hmac'

/** Preview tokens last 12 hours — not the revalidate webhook secret. */
const PREVIEW_TTL_SEC = 60 * 60 * 12
const TOKEN_VERSION = 'p1'

function getPreviewSecret(): string | null {
  const dedicated = process.env.PREVIEW_SECRET?.trim()
  if (dedicated && dedicated.length >= 16) return dedicated

  // Dev fallback only — never reuse REVALIDATE_SECRET in production preview URLs.
  if (process.env.NODE_ENV !== 'production') {
    const session = process.env.ADMIN_SESSION_SECRET?.trim()
    if (session && session.length >= 16) return `preview-dev:${session}`
    const password = process.env.ADMIN_PASSWORD?.trim()
    if (password) return `preview-dev:${password}`
  }

  return null
}

/**
 * Short-lived signed preview token bound to a content slug (case / event / …).
 * Format: p1.<exp>.<slugB64>.<sig>
 */
export async function createPreviewToken(slug: string): Promise<string | null> {
  const secret = getPreviewSecret()
  const normalized = slug.trim()
  if (!secret || !normalized) return null

  const exp = Math.floor(Date.now() / 1000) + PREVIEW_TTL_SEC
  const slugPart = Buffer.from(normalized, 'utf8').toString('base64url')
  const payload = `${TOKEN_VERSION}.${exp}.${slugPart}`
  const sig = await hmacSha256Base64Url(secret, payload)
  return `${payload}.${sig}`
}

export async function isPreviewAuthorized(
  preview: string | string[] | undefined,
  slug: string,
): Promise<boolean> {
  const value = Array.isArray(preview) ? preview[0] : preview
  if (!value || !slug.trim()) return false

  const secret = getPreviewSecret()
  if (!secret) {
    // Dev convenience: ?preview=1 only when no PREVIEW_SECRET configured
    if (process.env.NODE_ENV !== 'production' && (value === '1' || value === 'true')) {
      return true
    }
    return false
  }

  const parts = value.split('.')
  if (parts.length !== 4) return false
  const [version, expStr, slugPart, sig] = parts
  if (version !== TOKEN_VERSION || !expStr || !slugPart || !sig) return false

  const exp = Number(expStr)
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return false

  let tokenSlug = ''
  try {
    tokenSlug = Buffer.from(slugPart, 'base64url').toString('utf8')
  } catch {
    return false
  }

  if (tokenSlug !== slug.trim()) return false

  return verifyHmacSha256Base64Url(secret, `${version}.${expStr}.${slugPart}`, sig)
}

export const createCasePreviewToken = createPreviewToken
export const createEventPreviewToken = createPreviewToken
export const isCasePreviewAuthorized = isPreviewAuthorized
export const isEventPreviewAuthorized = isPreviewAuthorized

/** @deprecated use createPreviewToken(slug) */
export async function casePreviewQueryValue(slug?: string): Promise<string | null> {
  if (!slug) return null
  return createPreviewToken(slug)
}
