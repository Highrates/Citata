import assert from 'node:assert/strict'
import test from 'node:test'
import {
  homeOrderConflictMessage,
  parseHomeOrder,
} from '@/lib/admin/home-order'

test('parseHomeOrder accepts positive integers', () => {
  assert.equal(parseHomeOrder('3'), 3)
  assert.equal(parseHomeOrder(' 12 '), 12)
  assert.equal(parseHomeOrder('3.9'), 3)
})

test('parseHomeOrder rejects empty or non-positive', () => {
  assert.equal(parseHomeOrder(''), null)
  assert.equal(parseHomeOrder('0'), null)
  assert.equal(parseHomeOrder('-1'), null)
  assert.equal(parseHomeOrder('abc'), null)
})

test('homeOrderConflictMessage names collection', () => {
  assert.match(
    homeOrderConflictMessage({
      kind: 'case',
      slug: 'acme',
      title: 'Acme',
      homeOrder: 2,
    }),
    /кейсом «Acme»/,
  )
  assert.match(
    homeOrderConflictMessage({
      kind: 'event',
      slug: 'news',
      title: 'News',
      homeOrder: 1,
    }),
    /событием «News»/,
  )
})
