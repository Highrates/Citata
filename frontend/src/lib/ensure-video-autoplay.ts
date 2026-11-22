/**
 * Ensure every <video> in stored rich HTML can autoplay in browsers
 * (muted + playsinline required). Idempotent for already-annotated tags.
 */
export function ensureVideoAutoplay(html: string): string {
  return html.replace(/<video\b([^>]*)>/gi, (_match, rawAttrs: string) => {
    let attrs = rawAttrs
    const ensure = (name: string) => {
      const re = new RegExp(`\\s${name}(?:\\s|=|$)`, 'i')
      if (re.test(attrs)) return
      attrs += ` ${name}`
    }
    ensure('autoplay')
    ensure('muted')
    ensure('loop')
    ensure('playsinline')
    return `<video${attrs}>`
  })
}
