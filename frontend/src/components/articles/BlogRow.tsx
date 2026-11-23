import Image from 'next/image'
import Link from 'next/link'
import type { Article } from '@/content/types'
import { formatArticleDateRu, formatReadingTimeRu } from '@/lib/reading-time'

type BlogRowProps = {
  item: Article
}

export function BlogRow({ item }: BlogRowProps) {
  return (
    <Link href={`/articles/${item.slug}`} className="blog-row">
      <div className="blog-row__author">
        {item.author.photo ? (
          <span className="blog-row__avatar">
            <Image
              src={item.author.photo}
              alt=""
              width={64}
              height={64}
              className="blog-row__avatar-img"
            />
          </span>
        ) : (
          <span className="blog-row__avatar blog-row__avatar--empty" aria-hidden />
        )}
        <span className="blog-row__author-text">
          <span className="blog-row__name">{item.author.name}</span>
          {item.author.role ? <span className="blog-row__role">{item.author.role}</span> : null}
        </span>
      </div>

      <div className="blog-row__main">
        <span className="blog-row__meta">
          {[formatArticleDateRu(item.publishedAt), formatReadingTimeRu(item.readingTime)]
            .filter(Boolean)
            .join(' · ')}
        </span>
        <span className="blog-row__title">{item.title}</span>
      </div>

      <span className="blog-row__arrow" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M4 10h11M11 5l5 5-5 5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  )
}
