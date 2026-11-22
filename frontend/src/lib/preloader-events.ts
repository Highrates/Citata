export const PRELOADER_REVEAL_EVENT = 'citata:preloader-reveal'
export const PRELOADER_DONE_EVENT = 'citata:preloader-done'

/** Resolve when boot preloader is gone (or never shown). */
export function waitForPreloaderReveal(): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve()
  if (!document.documentElement.classList.contains('is-preloading')) {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    let settled = false
    const done = () => {
      if (settled) return
      settled = true
      window.removeEventListener(PRELOADER_REVEAL_EVENT, done)
      window.removeEventListener(PRELOADER_DONE_EVENT, done)
      resolve()
    }
    window.addEventListener(PRELOADER_REVEAL_EVENT, done)
    window.addEventListener(PRELOADER_DONE_EVENT, done)
  })
}

export function dispatchPreloaderReveal() {
  window.dispatchEvent(new CustomEvent(PRELOADER_REVEAL_EVENT))
}

export function dispatchPreloaderDone() {
  document.documentElement.classList.remove('is-preloading')
  window.dispatchEvent(new CustomEvent(PRELOADER_DONE_EVENT))
}
