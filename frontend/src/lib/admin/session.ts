import { cookies } from 'next/headers'

import {
  ADMIN_SESSION_COOKIE,
  SESSION_MAX_AGE_SEC,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from '@/lib/admin/session-token'

export {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  verifyAdminCredentials,
  verifyAdminSessionToken,
} from '@/lib/admin/session-token'

export async function createAdminSession() {
  const token = await createAdminSessionToken()
  if (!token) {
    throw new Error('ADMIN_SESSION_SECRET (or ADMIN_PASSWORD in dev) is required for sessions')
  }

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SEC,
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  const clear = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  }
  cookieStore.set(ADMIN_SESSION_COOKIE, '', { ...clear, path: '/admin' })
  cookieStore.set(ADMIN_SESSION_COOKIE, '', { ...clear, path: '/' })
}

export async function hasValidAdminSessionCookie(): Promise<boolean> {
  const cookieStore = await cookies()
  return verifyAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)
}
