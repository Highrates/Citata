export const CONTENT_SOURCE = process.env.CONTENT_SOURCE ?? 'fixtures'

export function usesPayloadContent() {
  return CONTENT_SOURCE === 'payload'
}
