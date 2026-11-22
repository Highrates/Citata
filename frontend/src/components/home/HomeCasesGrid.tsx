'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Case } from '@/content/types'

type CaseItem = Pick<Case, 'slug' | 'title' | 'cover' | 'coverAlt' | 'year' | 'summary'>

type HomeCasesGridProps = {
  cases: CaseItem[]
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

type SizedCase = CaseItem & { aspect: number; key: string }

function packRows(items: CaseItem[]): SizedCase[][] {
  const rows: SizedCase[][] = []
  let index = 0
  let patternIndex = 0

  while (index < items.length) {
    const pattern = ROW_ASPECTS[patternIndex % ROW_ASPECTS.length]!
    const remaining = items.length - index
    // Prefer the pattern length; if leftover is short, fold into this row (cap 5)
    let take = Math.min(pattern.length, remaining)
    if (remaining - take > 0 && remaining - take < 3) {
      take = Math.min(5, remaining)
    }

    const row: SizedCase[] = []
    for (let i = 0; i < take; i++) {
      const item = items[index + i]!
      const aspect = pattern[i % pattern.length]!
      row.push({
        ...item,
        aspect,
        key: `${item.slug}-${index + i}`,
      })
    }
    rows.push(row)
    index += take
    patternIndex += 1
  }

  return rows
}

function metaLine(item: CaseItem): string | null {
  const summary = item.summary?.trim()
  return summary || null
}

export function HomeCasesGrid({ cases }: HomeCasesGridProps) {
  if (!cases.length) return null

  const rows = packRows(cases)

  return (
    <div className="home-cases-grid" aria-label="Кейсы">
      {rows.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="home-cases-grid__row">
          {row.map((item) => {
            const meta = metaLine(item)
            return (
              <article
                key={item.key}
                className="home-cases-grid__item"
                style={{ flexGrow: item.aspect, flexBasis: 0 }}
              >
                <Link href={`/works/${item.slug}`} className="home-cases-grid__card">
                  <div
                    className="home-cases-grid__media"
                    style={{ aspectRatio: `${item.aspect}` }}
                  >
                    <Image
                      src={item.cover}
                      alt={item.coverAlt}
                      fill
                      sizes="(max-width: 560px) 100vw, (max-width: 960px) 33vw, 20vw"
                      className="home-cases-grid__image"
                    />
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
