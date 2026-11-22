'use client'

import Image from 'next/image'
import Link from 'next/link'

export type MediaGridItem = {
  slug: string
  title: string
  cover: string
  coverAlt: string
  summary?: string
  href: string
  coverKind?: 'image' | 'video'
}

type HomeCasesGridProps = {
  cases: MediaGridItem[]
  label?: string
}

/**
 * Row lengths cycle like a dense Apostrophe news pass: 3 / 4 / 5.
 * Per-row aspect lists (width/height) keep cells uneven inside the row.
 */
const ROW_ASPECTS: number[][] = [
  [0.72, 0.85, 1.45, 0.68], // 4
  [1.35, 0.7, 0.78], // 3
  [0.65, 0.72, 0.58, 0.8, 0.9], // 5
  [0.7, 1.5, 0.66, 0.75], // 4
  [0.95, 1.4, 0.68], // 3
  [0.62, 0.78, 0.7, 0.55, 0.85], // 5
  [1.25, 0.7, 0.82, 0.68], // 4
  [0.74, 0.66, 1.55], // 3
]

const FIRST_FOLD_PRIORITY = 4

type SizedItem = MediaGridItem & { aspect: number; key: string; flatIndex: number }

function isVideoCover(item: MediaGridItem) {
  if (item.coverKind === 'video') return true
  if (item.coverKind === 'image') return false
  return /\.(mp4|webm|mov)(\?|$)/i.test(item.cover)
}

function packRows(items: MediaGridItem[]): SizedItem[][] {
  const rows: SizedItem[][] = []
  let index = 0
  let patternIndex = 0

  while (index < items.length) {
    const pattern = ROW_ASPECTS[patternIndex % ROW_ASPECTS.length]!
    const remaining = items.length - index
    let take = Math.min(pattern.length, remaining)
    if (remaining - take > 0 && remaining - take < 3) {
      take = Math.min(5, remaining)
    }

    const row: SizedItem[] = []
    for (let i = 0; i < take; i++) {
      const item = items[index + i]!
      const aspect = pattern[i % pattern.length]!
      row.push({
        ...item,
        aspect,
        key: `${item.href}-${index + i}`,
        flatIndex: index + i,
      })
    }
    rows.push(row)
    index += take
    patternIndex += 1
  }

  return rows
}

export function HomeCasesGrid({ cases, label = 'Кейсы' }: HomeCasesGridProps) {
  if (!cases.length) return null

  const rows = packRows(cases)

  return (
    <div className="home-cases-grid" aria-label={label}>
      {rows.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="home-cases-grid__row">
          {row.map((item) => {
            const meta = item.summary?.trim() || null
            const video = isVideoCover(item)
            return (
              <article
                key={item.key}
                className="home-cases-grid__item"
                style={{ flexGrow: item.aspect, flexBasis: 0 }}
              >
                <Link href={item.href} className="home-cases-grid__card">
                  <div
                    className="home-cases-grid__media"
                    style={{ ['--case-aspect' as string]: String(item.aspect) }}
                  >
                    {video ? (
                      <video
                        className="home-cases-grid__image home-cases-grid__video"
                        src={item.cover}
                        muted
                        playsInline
                        autoPlay
                        loop
                        preload="metadata"
                        aria-label={item.coverAlt}
                      />
                    ) : (
                      <Image
                        src={item.cover}
                        alt={item.coverAlt}
                        fill
                        priority={item.flatIndex < FIRST_FOLD_PRIORITY}
                        sizes="(max-width: 560px) 100vw, (max-width: 960px) 50vw, 20vw"
                        className="home-cases-grid__image"
                      />
                    )}
                  </div>
                  <div className="home-cases-grid__info">
                    <h3 className="home-cases-grid__title">{item.title}</h3>
                    {meta ? <p className="home-cases-grid__meta">{meta}</p> : null}
                  </div>
                </Link>
              </article>
            )
          })}
        </div>
      ))}
    </div>
  )
}
