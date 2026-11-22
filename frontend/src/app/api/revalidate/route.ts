import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret')
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
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
