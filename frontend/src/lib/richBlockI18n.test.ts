import assert from 'node:assert/strict'
import test from 'node:test'
import { detectRichBlockLocale, richBlockStrings } from '@/lib/richBlockI18n'

test('richBlockStrings returns locale-specific copy', () => {
  assert.equal(richBlockStrings('ru').bold, 'Жирный')
  assert.equal(richBlockStrings('zh').bold, '加粗')
})

test('detectRichBlockLocale falls back when no DOM', () => {
  assert.equal(detectRichBlockLocale('ru'), 'ru')
})
