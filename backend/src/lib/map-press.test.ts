import assert from 'node:assert/strict'
import test from 'node:test'
import { pressMentions } from '@/content/press'
import { validatePressMention } from '@/content/press-model'
import {
  mapPayloadPressMentionToPressMention,
  mapPressMentionToPayloadData,
} from '@/lib/map-press'
import type { PressMention as PayloadPressMention } from '@/payload-types'

test('fixture press mentions conform to canonical model', () => {
  for (const item of pressMentions) {
    assert.deepEqual(validatePressMention(item), [])
  }
})

test('round-trip: fixture → payload → fixture', () => {
  const fixture = pressMentions[0]
  const payloadData = mapPressMentionToPayloadData(fixture)
  const restored = mapPayloadPressMentionToPressMention({
    id: 1,
    ...payloadData,
    updatedAt: '',
    createdAt: '',
  } as PayloadPressMention)

  assert.deepEqual(restored, fixture)
})
