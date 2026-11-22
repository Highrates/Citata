import type { PressMention } from './types'

export function validatePressMention(item: PressMention): string[] {
  const errors: string[] = []
  if (!item.title?.trim()) errors.push('title обязателен')
  if (!item.source?.trim()) errors.push('source обязателен')
  if (!item.url?.trim()) errors.push('url обязателен')
  return errors
}
