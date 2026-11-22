/**
 * Edge-safe HMAC helpers (Web Crypto) for middleware + Node routes.
 */

const textEncoder = new TextEncoder()

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let binary = ''
  for (let i = 0; i < view.length; i++) binary += String.fromCharCode(view[i]!)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(value: string): Uint8Array | null {
  try {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/')
    const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
    const binary = atob(padded + pad)
    const out = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i)
    return out
  } catch {
    return null
  }
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

export async function hmacSha256Base64Url(secret: string, message: string): Promise<string> {
  const key = await importHmacKey(secret)
  const sig = await crypto.subtle.sign('HMAC', key, textEncoder.encode(message))
  return toBase64Url(sig)
}

/** Constant-time compare for equal-length byte arrays. */
export function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!
  return diff === 0
}

export async function timingSafeEqualString(a: string, b: string): Promise<boolean> {
  const key = await importHmacKey('citata-compare')
  const [ha, hb] = await Promise.all([
    crypto.subtle.sign('HMAC', key, textEncoder.encode(a)),
    crypto.subtle.sign('HMAC', key, textEncoder.encode(b)),
  ])
  return timingSafeEqualBytes(new Uint8Array(ha), new Uint8Array(hb))
}

export async function verifyHmacSha256Base64Url(
  secret: string,
  message: string,
  signature: string,
): Promise<boolean> {
  const expected = await hmacSha256Base64Url(secret, message)
  const a = fromBase64Url(expected)
  const b = fromBase64Url(signature)
  if (!a || !b) return false
  return timingSafeEqualBytes(a, b)
}

export function randomBase64Url(byteLength = 16): string {
  const bytes = new Uint8Array(byteLength)
  crypto.getRandomValues(bytes)
  return toBase64Url(bytes)
}
