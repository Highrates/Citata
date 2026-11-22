'use client'

export type UploadedMedia = {
  id: number
  url: string
  alt: string
  mimeType?: string
}

export async function uploadAdminMedia(file: File, alt?: string): Promise<UploadedMedia> {
  const fd = new FormData()
  fd.append('file', file)
  if (alt) fd.append('alt', alt)

  const res = await fetch('/api/admin/media/upload', {
    method: 'POST',
    body: fd,
    credentials: 'same-origin',
  })

  const data = (await res.json().catch(() => ({}))) as {
    error?: string
    id?: number
    url?: string
    alt?: string
    mimeType?: string
  }

  if (!res.ok || !data.id || !data.url) {
    throw new Error(data.error || `Ошибка загрузки (${res.status})`)
  }

  return {
    id: data.id,
    url: data.url,
    alt: data.alt || alt || file.name,
    mimeType: data.mimeType,
  }
}

export async function uploadAdminRichMedia(file: File, _type: 'image' | 'video'): Promise<string> {
  const uploaded = await uploadAdminMedia(file)
  return uploaded.url
}
