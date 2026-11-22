import assert from 'node:assert/strict'
import test from 'node:test'

process.env.NODE_ENV = 'development'
process.env.ADMIN_EMAIL = 'admin@example.com'
process.env.ADMIN_PASSWORD = 'correct-horse-battery'
process.env.ADMIN_SESSION_SECRET = 'test-admin-session-secret-32ch'

const {
  createAdminSessionToken,
  verifyAdminCredentials,
  verifyAdminSessionToken,
} = await import('@/lib/admin/session-token')

test('signed session token verifies and rejects forgery', async () => {
  const token = await createAdminSessionToken()
  assert.ok(token)
  assert.equal(await verifyAdminSessionToken(token), true)
  assert.equal(await verifyAdminSessionToken('1'), false)
  assert.equal(await verifyAdminSessionToken(token!.slice(0, -2) + 'aa'), false)
})

test('credentials fail closed and compare safely', async () => {
  assert.equal(await verifyAdminCredentials('admin@example.com', 'correct-horse-battery'), true)
  assert.equal(await verifyAdminCredentials('admin@example.com', 'wrong'), false)
  assert.equal(await verifyAdminCredentials('other@example.com', 'correct-horse-battery'), false)
})
