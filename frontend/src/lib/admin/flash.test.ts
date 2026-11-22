import assert from 'node:assert/strict'
import test from 'node:test'
import { flashFromSearchParams } from '@/lib/admin/flash'

test('flashFromSearchParams reads saved and error', () => {
  assert.deepEqual(flashFromSearchParams({ saved: '1' }), { saved: true, error: undefined })
  assert.deepEqual(flashFromSearchParams({ error: encodeURIComponent('Ошибка') }), {
    saved: false,
    error: 'Ошибка',
  })
  assert.deepEqual(flashFromSearchParams({}), { saved: false, error: undefined })
})
