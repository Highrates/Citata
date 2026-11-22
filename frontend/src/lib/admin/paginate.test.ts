import assert from 'node:assert/strict'
import test from 'node:test'
import { fetchAllPages } from '@/lib/admin/paginate'

test('fetchAllPages walks until hasNextPage is false', async () => {
  const calls: number[] = []
  const items = await fetchAllPages<{ id: number }>(
    async (page, limit) => {
      calls.push(page)
      assert.equal(limit, 2)
      if (page === 1) {
        return { docs: [{ id: 1 }, { id: 2 }], totalDocs: 3, hasNextPage: true }
      }
      return { docs: [{ id: 3 }], totalDocs: 3, hasNextPage: false }
    },
    { pageSize: 2 },
  )

  assert.deepEqual(
    items.map((i) => i.id),
    [1, 2, 3],
  )
  assert.deepEqual(calls, [1, 2])
})

test('fetchAllPages stops at maxPages', async () => {
  const items = await fetchAllPages<{ id: number }>(
    async (page) => ({
      docs: [{ id: page }],
      totalDocs: 100,
      hasNextPage: true,
    }),
    { pageSize: 1, maxPages: 3 },
  )
  assert.deepEqual(
    items.map((i) => i.id),
    [1, 2, 3],
  )
})
