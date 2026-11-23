import assert from 'node:assert/strict'
import test from 'node:test'
import { ensureAuthor, ensureMediaByUrl, resolveMediaId } from '@/lib/admin/ensure-content'
import { unwrapPayloadDoc } from '@/lib/api/unwrap-payload-doc'

/**
 * Smoke-test ensureAuthor / ensureMediaByUrl with a fake client whose create
 * returns Payload's `{ doc }` shape, then unwraps like getAdminPayload.create.
 */
function clientWithUnwrap(handlers: {
  find?: (args: {
    collection: string
    where?: Record<string, unknown>
  }) => Promise<{ docs: unknown[]; totalDocs: number; hasNextPage: boolean }>
  createRaw?: () => unknown
  update?: () => Promise<unknown>
}) {
  return {
    find: async <T>(args: { collection: string; where?: Record<string, unknown> }) =>
      (handlers.find?.(args) ?? { docs: [], totalDocs: 0, hasNextPage: false }) as {
        docs: T[]
        totalDocs: number
        hasNextPage: boolean
      },
    create: async <T>() => {
      const raw = handlers.createRaw?.() ?? { doc: { id: -1 } }
      return unwrapPayloadDoc(raw as T | { doc: T }) as T
    },
    update: async <T>() => (handlers.update?.() ?? {}) as T,
  }
}

test('ensureAuthor unwraps create { doc } and returns id', async () => {
  const created: number[] = []
  const payload = clientWithUnwrap({
    createRaw: () => {
      created.push(42)
      return { doc: { id: 42, name: 'Test Author' }, message: 'Created' }
    },
  })

  const id = await ensureAuthor(payload, 'Test Author', 'Editor')
  assert.equal(id, 42)
  assert.deepEqual(created, [42])
})

test('ensureAuthor returns existing id without create', async () => {
  let created = 0
  const payload = clientWithUnwrap({
    find: async () => ({
      docs: [{ id: 9, name: 'Existing', role: 'Old' }],
      totalDocs: 1,
      hasNextPage: false,
    }),
    createRaw: () => {
      created += 1
      return { doc: { id: 99 } }
    },
    update: async () => ({ id: 9 }),
  })

  const id = await ensureAuthor(payload, 'Existing', 'New role')
  assert.equal(id, 9)
  assert.equal(created, 0)
})

test('ensureMediaByUrl returns existing media id', async () => {
  let created = 0
  const payload = clientWithUnwrap({
    find: async () => ({
      docs: [{ id: 55, url: 'https://cdn.example.com/a.jpg' }],
      totalDocs: 1,
      hasNextPage: false,
    }),
    createRaw: () => {
      created += 1
      return { doc: { id: 99 } }
    },
  })

  const id = await ensureMediaByUrl(payload, 'https://cdn.example.com/a.jpg', 'Alt')
  assert.equal(id, 55)
  assert.equal(created, 0)
})

test('ensureMediaByUrl refuses stub create when missing', async () => {
  let created = 0
  const payload = clientWithUnwrap({
    createRaw: () => {
      created += 1
      return { doc: { id: 99 } }
    },
  })

  await assert.rejects(
    () => ensureMediaByUrl(payload, 'https://cdn.example.com/missing.jpg', 'Alt'),
    /Медиа не найдено/,
  )
  assert.equal(created, 0)
})

test('resolveMediaId prefers explicit mediaId', async () => {
  let finds = 0
  const payload = clientWithUnwrap({
    find: async () => {
      finds += 1
      return { docs: [], totalDocs: 0, hasNextPage: false }
    },
  })
  const id = await resolveMediaId(payload, { src: 'https://x/a.mp4', mediaId: 77 }, 'Alt')
  assert.equal(id, 77)
  assert.equal(finds, 0)
})
