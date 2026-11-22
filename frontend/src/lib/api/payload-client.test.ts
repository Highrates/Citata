import assert from 'node:assert/strict'
import test from 'node:test'
import { unwrapPayloadDoc } from '@/lib/api/unwrap-payload-doc'

test('unwrapPayloadDoc reads nested doc', () => {
  assert.deepEqual(unwrapPayloadDoc({ doc: { id: 7, name: 'A' }, message: 'ok' }), {
    id: 7,
    name: 'A',
  })
})

test('unwrapPayloadDoc passes through bare document', () => {
  assert.deepEqual(unwrapPayloadDoc({ id: 3, name: 'B' }), { id: 3, name: 'B' })
})
