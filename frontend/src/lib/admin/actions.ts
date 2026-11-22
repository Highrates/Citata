'use server'

import { redirect } from 'next/navigation'

import { ADMIN_BASE } from '@/lib/admin/constants'
import { createAdminSession, verifyAdminCredentials } from '@/lib/admin/session'

export async function loginAdminAction(formData: FormData) {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const next = String(formData.get('next') ?? ADMIN_BASE)

  if (!verifyAdminCredentials(email, password)) {
    redirect(`${ADMIN_BASE}/login?error=1`)
  }

  await createAdminSession()
  redirect(next.startsWith(ADMIN_BASE) ? next : ADMIN_BASE)
}

export async function logoutAdminAction() {
  const { clearAdminSession } = await import('@/lib/admin/session')
  await clearAdminSession()
  redirect(`${ADMIN_BASE}/login`)
}
