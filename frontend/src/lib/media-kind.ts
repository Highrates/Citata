/** Detect video from explicit kind or file URL. */
export function isVideoMedia(src: string, kind?: 'image' | 'video' | null): boolean {
  if (kind === 'video') return true
  if (kind === 'image') return false
  return /\.(mp4|webm|mov)(\?|$)/i.test(src)
}
