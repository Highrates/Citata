import type { Metadata } from 'next'
import { ArticlesPageContent } from '@/components/articles/ArticlesPageContent'
import { fetchArticles } from '@/lib/content-articles'
import { fetchPressMentions } from '@/lib/content-press'

export const metadata: Metadata = {
  title: 'Блог',
  description: 'Статьи PR-агентства ЦИТАТА о стратегии, коммуникациях и медиа.',
}

export const revalidate = 300

export default async function ArticlesPage() {
  const [articles, press] = await Promise.all([fetchArticles(), fetchPressMentions()])

  return <ArticlesPageContent articles={articles} press={press} />
}
