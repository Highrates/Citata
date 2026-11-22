import assert from 'node:assert/strict'
import test from 'node:test'
import { buildPayloadWhereParams } from '@/lib/admin/payload-where'

test('flattens equals filters', () => {
  assert.deepEqual(buildPayloadWhereParams({ slug: { equals: 'demo' } }), {
    'where[slug][equals]': 'demo',
  })
})

test('flattens and / or groups', () => {
  assert.deepEqual(
    buildPayloadWhereParams({
      and: [{ slug: { equals: 'a' } }, { status: { equals: 'published' } }],
    }),
    {
      'where[and][0][slug][equals]': 'a',
      'where[and][1][status][equals]': 'published',
    },
  )
})

test('flattens in arrays and nested ops', () => {
  assert.deepEqual(
    buildPayloadWhereParams({
      id: { in: [1, 2] },
      title: { contains: 'pr' },
    }),
    {
      'where[id][in][0]': 1,
      'where[id][in][1]': 2,
      'where[title][contains]': 'pr',
    },
  )
})
