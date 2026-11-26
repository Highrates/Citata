import 'server-only'

import { unstable_cache } from 'next/cache'
import { articles } from '@/content/articles'
import type { Article } from '@/content/types'
import { fetchAllPages } from '@/lib/admin/paginate'
import { payloadGet, type PayloadListResponse } from '@/lib/api/payload-client'
import { usesPayloadContent } from '@/lib/content-source'
import { mapPayloadArticleToArticle } from '@/lib/map-article'
import type { Article as PayloadArticle } from '@/payload-types'

function sortArticles(items: Article[]) {
  return [...items].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
}

export function getFixtureArticles(): Article[] {
  return sortArticles(articles)
}

const fetchPayloadArticles = unstable_cache(
  async (): Promise<Article[]> => {
    const docs = await fetchAllPages<PayloadArticle>((page, limit) =>
      payloadGet<PayloadListResponse<PayloadArticle>>('/api/articles', {
        'where[status][equals]': 'published',
        depth: 2,
        limit,
        page,
        sort: '-publishedAt',
      }),
    )
    return sortArticles(docs.map(mapPayloadArticleToArticle))
  },
  ['payload-articles'],
  { tags: ['articles'], revalidate: 300 },
)

export async function fetchArticles(): Promise<Article[]> {
  if (usesPayloadContent()) return fetchPayloadArticles()
  return getFixtureArticles()
}

export async function fetchArticleBySlug(slug: string): Promise<Article | undefined> {
  const all = await fetchArticles()
  return all.find((a) => a.slug === slug)
}
