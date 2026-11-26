import type { Article } from './types'

/**
 * Articles («Статьи») start empty after news → events split.
 * Former news fixtures live in `content/events.ts` and seed via `seed:events`.
 */
export const articles: Article[] = []
