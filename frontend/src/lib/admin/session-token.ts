import {
  hmacSha256Base64Url,
  randomBase64Url,
  timingSafeEqualString,
  verifyHmacSha256Base64Url,
} from '@/lib/crypto/hmac'

export const ADMIN_SESSION_COOKIE = 'citata_admin_session'

export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7
const TOKEN_VERSION = 'v1'

function getSessionSecret(): string | null {
  const dedicated = process.env.ADMIN_SESSION_SECRET?.trim()
  if (dedicated && dedicated.length >= 16) return dedicated

  if (process.env.NODE_ENV !== 'production') {
    const password = process.env.ADMIN_PASSWORD?.trim()
    if (password) return `citata-dev-session:${password}`
  }

  return null
}

export async function createAdminSessionToken(): Promise<string | null> {
  const secret = getSessionSecret()
  if (!secret) return null

  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SEC
  const nonce = randomBase64Url(16)
  const payload = `${TOKEN_VERSION}.${exp}.${nonce}`
  const sig = await hmacSha256Base64Url(secret, payload)
  return `${payload}.${sig}`
}

/** Verify signed session cookie (Edge + Node). */
export async function verifyAdminSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false
  const secret = getSessionSecret()
  if (!secret) return false

  const parts = token.split('.')
  if (parts.length !== 4) return false
  const [version, expStr, nonce, sig] = parts
  if (version !== TOKEN_VERSION || !expStr || !nonce || !sig) return false

  const exp = Number(expStr)
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return false

  return verifyHmacSha256Base64Url(secret, `${version}.${expStr}.${nonce}`, sig)
}

/**
 * Fail closed: missing ADMIN_EMAIL / ADMIN_PASSWORD → deny.
 * No hardcoded default credentials. Timing-safe compare.
 */
export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  const expectedEmail = process.env.ADMIN_EMAIL?.trim()
  const expectedPassword = process.env.ADMIN_PASSWORD

  if (!expectedEmail || !expectedPassword) {
    return false
  }

  if (!email.trim() || !password) {
    return false
  }

  const emailOk = await timingSafeEqualString(email.trim().toLowerCase(), expectedEmail.toLowerCase())
  const passwordOk = await timingSafeEqualString(password, expectedPassword)
  return emailOk && passwordOk
}
