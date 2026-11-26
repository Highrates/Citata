import assert from 'node:assert/strict'
import test from 'node:test'

process.env.NODE_ENV = 'development'
process.env.PREVIEW_SECRET = 'test-preview-secret-32characters!'

const {
  createCasePreviewToken,
  createEventPreviewToken,
  isCasePreviewAuthorized,
  isEventPreviewAuthorized,
} = await import('@/lib/preview')

test('preview token is bound to slug and expires check', async () => {
  const token = await createCasePreviewToken('demo-case')
  assert.ok(token)
  assert.equal(await isCasePreviewAuthorized(token, 'demo-case'), true)
  assert.equal(await isCasePreviewAuthorized(token, 'other-case'), false)
  assert.equal(await isCasePreviewAuthorized(process.env.REVALIDATE_SECRET, 'demo-case'), false)
})

test('event preview token matches case token scheme', async () => {
  const token = await createEventPreviewToken('demo-event')
  assert.ok(token)
  assert.equal(await isEventPreviewAuthorized(token, 'demo-event'), true)
  assert.equal(await isEventPreviewAuthorized(token, 'other-event'), false)
})
