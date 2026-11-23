export type HomeOrderKind = 'case' | 'article'

export type HomeOrderOccupant = {
  kind: HomeOrderKind
  slug: string
  title: string
  homeOrder: number
}

export type HomeOrderCheckResult = {
  order: number
  available: boolean
  conflict?: HomeOrderOccupant
  suggestedNext: number
}

export function parseHomeOrder(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const value = Number(trimmed)
  if (!Number.isFinite(value) || value <= 0) return null
  return Math.floor(value)
}

export function homeOrderConflictMessage(conflict: HomeOrderOccupant): string {
  const kindLabel = conflict.kind === 'case' ? 'кейсом' : 'статьёй'
  return `Позиция ${conflict.homeOrder} уже занята ${kindLabel} «${conflict.title}»`
}
