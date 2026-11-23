import Image from 'next/image'
import Link from 'next/link'
import type { Article } from '@/content/types'
import { formatDateRu } from '@/lib/content'
import { isVideoMedia } from '@/lib/media-kind'

type ArticleCardProps = {
  item: Article
  showAuthor?: boolean
}

export function ArticleCard({ item, showAuthor = true }: ArticleCardProps) {
  const video = isVideoMedia(item.cover, item.gallery?.[0]?.kind)

  return (
    <Link href={`/articles/${item.slug}`} className="article-card">
      <div className="article-card__media">
        {video ? (
          <video
            className="article-card__image"
            src={item.cover}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            aria-label={item.coverAlt || item.title}
          />
        ) : (
          <Image
            src={item.cover}
            alt={item.coverAlt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="article-card__image"
          />
        )}
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
          {[
            formatDateRu(item.publishedAt),
            item.readingTime != null ? `${item.readingTime} мин` : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
    </Link>
  )
}
