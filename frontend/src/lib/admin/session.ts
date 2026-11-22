import { cookies } from 'next/headers'

export const ADMIN_SESSION_COOKIE = 'citata_admin_session'

const SESSION_MAX_AGE = 60 * 60 * 24 * 7

export function verifyAdminCredentials(email: string, password: string): boolean {
  const expectedEmail = process.env.ADMIN_EMAIL
  const expectedPassword = process.env.ADMIN_PASSWORD

  if (!expectedEmail || !expectedPassword) {
    return process.env.NODE_ENV === 'development'
  }

  return email === expectedEmail && password === expectedPassword
}

export async function createAdminSession() {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    // Нужен и для /admin, и для /api/admin/* (загрузка медиа)
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  // Снимаем и со старого path:/admin, и с /
  cookieStore.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/admin',
    maxAge: 0,
  })
  cookieStore.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}
