/** Shared upload constraints for browser + route. */

export const ADMIN_UPLOAD_MAX_BYTES = 25 * 1024 * 1024 // 25 MB

export const ADMIN_UPLOAD_ALLOWED_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'video/quicktime',
] as const

const ALLOWED = new Set<string>(ADMIN_UPLOAD_ALLOWED_MIME)

export function isAllowedAdminUploadMime(mime: string): boolean {
  const normalized = mime.trim().toLowerCase()
  if (ALLOWED.has(normalized)) return true
  // Some browsers send empty type — fall back to extension checks elsewhere.
  return false
}

export function adminUploadAcceptAttr(): string {
  return 'image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml,video/mp4,video/webm,video/quicktime'
}

export function validateAdminUploadFile(file: {
  type: string
  size: number
  name?: string
}): string | null {
  if (file.size <= 0) return 'Пустой файл'
  if (file.size > ADMIN_UPLOAD_MAX_BYTES) {
    return `Файл больше ${Math.round(ADMIN_UPLOAD_MAX_BYTES / (1024 * 1024))} МБ`
  }

  const mime = file.type.trim().toLowerCase()
  if (mime && isAllowedAdminUploadMime(mime)) return null

  const name = (file.name || '').toLowerCase()
  if (/\.(jpe?g|png|webp|gif|avif|svg|mp4|webm|mov)$/i.test(name)) return null

  return 'Допустимы изображения (JPEG/PNG/WebP/GIF/AVIF/SVG) и видео (MP4/WebM/MOV)'
}
