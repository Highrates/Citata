import assert from 'node:assert/strict'
import test from 'node:test'
import { moveItem, sortOrderFromIndex } from '@/lib/admin/sortable'

test('moveItem reorders without mutating source', () => {
  const src = ['a', 'b', 'c']
  assert.deepEqual(moveItem(src, 0, 2), ['b', 'c', 'a'])
  assert.deepEqual(src, ['a', 'b', 'c'])
})

test('sortOrderFromIndex is 1-based', () => {
  assert.equal(sortOrderFromIndex(0), 1)
  assert.equal(sortOrderFromIndex(3), 4)
})
