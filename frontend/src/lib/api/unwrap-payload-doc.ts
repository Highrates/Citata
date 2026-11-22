/** Payload REST create/update often wraps the document as `{ doc: T }`. */
export type PayloadMutationResponse<T> = T | { doc: T; message?: string }

export function unwrapPayloadDoc<T>(raw: PayloadMutationResponse<T> | null | undefined): T {
  if (raw == null) {
    throw new Error('Payload вернул пустой ответ')
  }
  if (typeof raw === 'object' && raw !== null && 'doc' in raw && (raw as { doc: unknown }).doc != null) {
    return (raw as { doc: T }).doc
  }
  return raw as T
}
