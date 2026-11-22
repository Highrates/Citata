'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { ADMIN_BASE } from '@/lib/admin/constants'
import {
  clearLoginFailures,
  checkLoginRateLimit,
  recordLoginFailure,
} from '@/lib/admin/login-rate-limit'
import { createAdminSession, verifyAdminCredentials } from '@/lib/admin/session'

function clientKeyFromHeaders(h: Headers): string {
  const forwarded = h.get('x-forwarded-for')?.split(',')[0]?.trim()
  const realIp = h.get('x-real-ip')?.trim()
  return forwarded || realIp || 'unknown'
}

export async function loginAdminAction(formData: FormData) {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const next = String(formData.get('next') ?? ADMIN_BASE)

  const h = await headers()
  const rateKey = `login:${clientKeyFromHeaders(h)}`
  const limit = checkLoginRateLimit(rateKey)
  if (!limit.ok) {
    redirect(`${ADMIN_BASE}/login?error=rate`)
  }

  const ok = await verifyAdminCredentials(email, password)
  if (!ok) {
    recordLoginFailure(rateKey)
    redirect(`${ADMIN_BASE}/login?error=1`)
  }

  clearLoginFailures(rateKey)

  try {
    await createAdminSession()
  } catch {
    redirect(`${ADMIN_BASE}/login?error=config`)
  }

  redirect(next.startsWith(ADMIN_BASE) ? next : ADMIN_BASE)
}

export async function logoutAdminAction() {
  const { clearAdminSession } = await import('@/lib/admin/session')
  await clearAdminSession()
  redirect(`${ADMIN_BASE}/login`)
}
