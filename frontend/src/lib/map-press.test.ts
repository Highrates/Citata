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

  assert.equal(restored.id, 1)
  assert.equal(restored.title, fixture.title)
  assert.equal(restored.source, fixture.source)
  assert.equal(restored.url, fixture.url)
  assert.equal(restored.sortOrder, fixture.sortOrder)
})
