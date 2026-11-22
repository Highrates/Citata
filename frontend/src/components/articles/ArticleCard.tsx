import Image from 'next/image'
import Link from 'next/link'
import type { Article } from '@/content/types'
import { formatDateRu } from '@/lib/content'

type ArticleCardProps = {
  item: Article
  showAuthor?: boolean
}

export function ArticleCard({ item, showAuthor = true }: ArticleCardProps) {
  return (
    <Link href={`/articles/${item.slug}`} className="article-card">
      <div className="article-card__media">
        <Image
          src={item.cover}
          alt={item.coverAlt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="article-card__image"
        />
      </div>
      <div className="article-card__body">
        {showAuthor ? (
          <p className="article-card__author">
            {item.author.name}
            <span>{item.author.role}</span>
          </p>
        ) : null}
        <h3 className="article-card__title">{item.title}</h3>
        <p className="article-card__meta">
          {formatDateRu(item.publishedAt)} · {item.readingTime} мин
        </p>
      </div>
    </Link>
  )
}
