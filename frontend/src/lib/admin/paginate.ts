import type { PayloadListResponse } from '@/lib/api/payload-client-types'

export const ADMIN_LIST_PAGE_SIZE = 100
export const ADMIN_LIST_MAX_PAGES = 50

/** Walk Payload list pages until exhausted (or maxPages). */
export async function fetchAllPages<T>(
  fetchPage: (page: number, limit: number) => Promise<PayloadListResponse<T>>,
  options?: { pageSize?: number; maxPages?: number },
): Promise<T[]> {
  const pageSize = options?.pageSize ?? ADMIN_LIST_PAGE_SIZE
  const maxPages = options?.maxPages ?? ADMIN_LIST_MAX_PAGES
  const items: T[] = []
  let page = 1

  while (page <= maxPages) {
    const result = await fetchPage(page, pageSize)
    items.push(...result.docs)
    if (!result.hasNextPage) break
    page += 1
  }

  return items
}
