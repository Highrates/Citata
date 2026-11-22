import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { ADMIN_BASE } from '@/lib/admin/constants'
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin/session-token'

const PUBLIC_ADMIN_PATHS = [`${ADMIN_BASE}/login`]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/cms')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/^\/cms/, ADMIN_BASE)
    return NextResponse.redirect(url, 308)
  }

  if (!pathname.startsWith(ADMIN_BASE)) {
    return NextResponse.next()
  }

  const isPublic = PUBLIC_ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )

  if (isPublic) {
    return NextResponse.next()
  }

  const raw = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  const valid = await verifyAdminSessionToken(raw)
  const isAdminApi =
    pathname.startsWith(`${ADMIN_BASE}/api/`) || pathname.startsWith('/api/admin/')

  if (!valid) {
    if (isAdminApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = `${ADMIN_BASE}/login`
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/cms/:path*', '/api/admin/:path*'],
}
