import { createHash, timingSafeEqual } from 'crypto'
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

function secretsMatch(provided: string, expected: string): boolean {
  const a = createHash('sha256').update(provided).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}

export async function POST(request: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET
  const secret = request.headers.get('x-revalidate-secret')

  if (!expected || !secret || !secretsMatch(secret, expected)) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as {
    path?: string
    tag?: string
  }

  if (body.path) revalidatePath(body.path)
  if (body.tag) revalidateTag(body.tag)

  revalidateTag('sitemap')

  return NextResponse.json({ revalidated: true, now: Date.now() })
}
