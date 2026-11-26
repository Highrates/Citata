/**
 * Импорт фикстур кейсов в Payload PostgreSQL.
 * Запуск: npx tsx scripts/seed-cases-from-fixtures.ts
 *
 * Требует DATABASE_URL и PAYLOAD_SECRET в .env.
 * Обложки создаются как media-записи с внешним URL (без скачивания).
 */
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') })
import { cases } from '../src/content/cases.js'
import type { CaseBlock } from '../src/content/types.js'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'
import { ensureMedia } from './lib/ensure-media.js'

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function blocksToHtml(blocks: CaseBlock[] | undefined): string | undefined {
  if (!blocks?.length) return undefined
  const parts: string[] = []
  for (const block of blocks) {
    switch (block.type) {
      case 'heading':
        parts.push(`<${block.level}>${escapeHtml(block.text)}</${block.level}>`)
        break
      case 'paragraph':
        parts.push(`<p>${escapeHtml(block.text)}</p>`)
        break
      case 'quote':
        parts.push(
          `<blockquote><p>${escapeHtml(block.text)}</p>${
            block.author ? `<cite>${escapeHtml(block.author)}</cite>` : ''
          }</blockquote>`,
        )
        break
      case 'image':
        parts.push(
          `<figure><img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}" />${
            block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ''
          }</figure>`,
        )
        break
      case 'list':
        parts.push(
          `<ul>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`,
        )
        break
      case 'metrics':
        parts.push(
          `<ul>${block.items
            .map(
              (item) =>
                `<li><strong>${escapeHtml(item.value)}</strong> ${escapeHtml(item.label)}</li>`,
            )
            .join('')}</ul>`,
        )
        break
    }
  }
  return parts.join('') || undefined
}

async function main() {
  const payload = await getPayload({ config })

  const slugToId = new Map<string, number>()

  for (const caseItem of cases) {
    const coverId = await ensureMedia(payload, caseItem.cover, caseItem.coverAlt)

    const existing = await payload.find({
      collection: 'cases',
      where: { slug: { equals: caseItem.slug } },
      limit: 1,
    })

    const data = {
      title: caseItem.title,
      slug: caseItem.slug,
      year: caseItem.year,
      summary: caseItem.summary,
      heroTitle: caseItem.heroTitle,
      description: caseItem.description || blocksToHtml(caseItem.blocks),
      featured: caseItem.featured ?? false,
      homeOrder:
        caseItem.featured && caseItem.homeOrder != null ? caseItem.homeOrder : null,
      sortOrder: caseItem.sortOrder,
      cover: coverId,
      gallery: [{ media: coverId }],
      status: 'published' as const,
      meta: caseItem.seo,
    }

    if (existing.docs[0]) {
      const updated = await payload.update({
        collection: 'cases',
        id: existing.docs[0].id,
        data,
      })
      slugToId.set(caseItem.slug, updated.id)
      console.log(`↻ updated: ${caseItem.slug}`)
    } else {
      const created = await payload.create({
        collection: 'cases',
        data,
      })
      slugToId.set(caseItem.slug, created.id)
      console.log(`+ created: ${caseItem.slug}`)
    }
  }

  console.log('✓ Seed complete')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
