import Image from 'next/image'
import Link from 'next/link'
import type { Case } from '@/content/types'
import { isVideoMedia } from '@/lib/media-kind'

type CaseCardProps = {
  item: Case
  index?: number
  variant?: 'grid' | 'featured'
  showYear?: boolean
  /** Keep native media ratio (9:16 etc), capped by CSS max-height. */
  naturalMedia?: boolean
}

export function CaseCard({
  item,
  index,
  variant = 'grid',
  showYear = true,
  naturalMedia = false,
}: CaseCardProps) {
  const video = isVideoMedia(item.cover, item.gallery?.[0]?.kind)

  return (
    <Link
      href={`/works/${item.slug}`}
      className={`case-card case-card--${variant}${naturalMedia ? ' case-card--natural' : ''}`}
    >
      <div className="case-card__media">
        {video ? (
          <video
            className="case-card__image"
            src={item.cover}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            aria-label={item.coverAlt || item.title}
          />
        ) : naturalMedia ? (
          // Native ratio: avoid next/Image `fill` box
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="case-card__image"
            src={item.cover}
            alt={item.coverAlt || item.title}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <Image
            src={item.cover}
            alt={item.coverAlt}
            fill
            sizes={
              variant === 'featured'
                ? '(max-width: 768px) 100vw, 33vw'
                : '(max-width: 768px) 100vw, 50vw'
            }
            className="case-card__image"
          />
        )}
      </div>
      <div className="case-card__body">
        {typeof index === 'number' ? (
          <span className="case-card__index">{String(index).padStart(2, '0')}</span>
        ) : null}
        <h3 className="case-card__title">{item.title}</h3>
        {showYear && item.year ? <p className="case-card__meta">{item.year} г.</p> : null}
      </div>
    </Link>
  )
}
