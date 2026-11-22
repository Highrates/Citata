/**
 * Каноническая модель кейса — единый контракт для фикстур, Payload CMS и фронта.
 * Основной контент: `description` (HTML). `blocks` — только legacy-фикстуры.
 */
import type { Case } from './types'

export function validateCase(caseData: Case): string[] {
  const errors: string[] = []
  if (!caseData.slug?.trim()) errors.push('slug обязателен')
  if (!caseData.title?.trim()) errors.push('title обязателен')
  if (!caseData.cover?.trim()) errors.push('cover обязателен')
  return errors
}
