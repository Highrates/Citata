import 'server-only'

export {
  unwrapPayloadDoc,
  type PayloadMutationResponse,
} from '@/lib/api/unwrap-payload-doc'
export type { PayloadListResponse } from '@/lib/api/payload-client-types'
import { unwrapPayloadDoc, type PayloadMutationResponse } from '@/lib/api/unwrap-payload-doc'
import type { PayloadListResponse } from '@/lib/api/payload-client-types'

type QueryValue = string | number | boolean | undefined | null

function getApiBase() {
  return (process.env.API_URL || 'http://127.0.0.1:3001').replace(/\/$/, '')
}

function authHeaders(write = false): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }
  if (write) {
    const key = process.env.PAYLOAD_API_KEY
    if (key) headers.Authorization = `users API-Key ${key}`
  }
  return headers
}

export function hasBackendApi() {
  return Boolean(process.env.API_URL || process.env.PAYLOAD_API_KEY)
}

export function hasPayloadApiKey() {
  return Boolean(process.env.PAYLOAD_API_KEY)
}

function buildQuery(params?: Record<string, QueryValue>) {
  if (!params) return ''
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export async function payloadGet<T>(
  path: string,
  params?: Record<string, QueryValue>,
  options?: { auth?: boolean },
): Promise<T> {
  const url = `${getApiBase()}${path.startsWith('/') ? path : `/${path}`}${buildQuery(params)}`
  const res = await fetch(url, {
    headers: authHeaders(Boolean(options?.auth)),
    next: { revalidate: 0 },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Payload GET ${path} failed: ${res.status} ${text}`)
  }
  return res.json() as Promise<T>
}

export async function payloadMutate<T>(
  method: 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  options?: { unwrapDoc?: boolean },
): Promise<T> {
  if (!hasPayloadApiKey()) {
    throw new Error('PAYLOAD_API_KEY не задан — запись в backend недоступна')
  }

  const url = `${getApiBase()}${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetch(url, {
    method,
    headers: {
      ...authHeaders(true),
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Payload ${method} ${path} failed: ${res.status} ${text}`)
  }

  if (res.status === 204) return undefined as T
  const json = (await res.json()) as PayloadMutationResponse<T>
  const shouldUnwrap = options?.unwrapDoc !== false && (method === 'POST' || method === 'PATCH')
  return shouldUnwrap ? unwrapPayloadDoc(json) : (json as T)
}
