import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_SESSION_COOKIE } from '@/lib/admin/session'

export const runtime = 'nodejs'

function apiBase() {
  return (process.env.API_URL || 'http://127.0.0.1:3001').replace(/\/$/, '')
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  if (!cookieStore.get(ADMIN_SESSION_COOKIE)?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.PAYLOAD_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'PAYLOAD_API_KEY не настроен' }, { status: 503 })
  }

  const incoming = await request.formData()
  const file = incoming.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Файл не передан' }, { status: 400 })
  }

  const altRaw = incoming.get('alt')
  const alt = typeof altRaw === 'string' && altRaw.trim() ? altRaw.trim() : file.name || 'Медиа'

  const outbound = new FormData()
  outbound.append('file', file)
  outbound.append('_payload', JSON.stringify({ alt }))

  const res = await fetch(`${apiBase()}/api/media`, {
    method: 'POST',
    headers: {
      Authorization: `users API-Key ${apiKey}`,
      Accept: 'application/json',
    },
    body: outbound,
  })

  const text = await res.text().catch(() => '')
  if (!res.ok) {
    return NextResponse.json(
      { error: text || `Ошибка загрузки (${res.status})` },
      { status: res.status },
    )
  }

  let doc: {
    doc?: { id?: number; url?: string | null; filename?: string | null; mimeType?: string | null; alt?: string }
    id?: number
    url?: string | null
    filename?: string | null
    mimeType?: string | null
    alt?: string
  }
  try {
    doc = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'Некорректный ответ Payload' }, { status: 502 })
  }

  const media = doc.doc ?? doc
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
  let url = media.url ?? ''
  if (url && url.startsWith('/')) url = `${siteUrl}${url}`
  if (!url && media.filename) {
    const s3 = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, '')
    url = s3 ? `${s3}/${media.filename}` : `${siteUrl}/media/${media.filename}`
  }

  if (!media.id || !url) {
    return NextResponse.json({ error: 'Payload не вернул id/url медиа' }, { status: 502 })
  }

  return NextResponse.json({
    id: media.id,
    url,
    alt: media.alt ?? alt,
    mimeType: media.mimeType ?? file.type,
  })
}
