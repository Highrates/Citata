/**
 * In-memory login rate limit (per process). Good enough for a single Node instance.
 */

const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 8

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

function getBucket(key: string): Bucket {
  const now = Date.now()
  const existing = buckets.get(key)
  if (!existing || existing.resetAt <= now) {
    const next = { count: 0, resetAt: now + WINDOW_MS }
    buckets.set(key, next)
    return next
  }
  return existing
}

export function checkLoginRateLimit(key: string): { ok: boolean; retryAfterSec?: number } {
  const bucket = getBucket(key)
  if (bucket.count >= MAX_ATTEMPTS) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - Date.now()) / 1000)),
    }
  }
  return { ok: true }
}

export function recordLoginFailure(key: string) {
  const bucket = getBucket(key)
  bucket.count += 1
}

export function clearLoginFailures(key: string) {
  buckets.delete(key)
}
