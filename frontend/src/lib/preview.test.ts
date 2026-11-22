import assert from 'node:assert/strict'
import test from 'node:test'

process.env.NODE_ENV = 'development'
process.env.PREVIEW_SECRET = 'test-preview-secret-32characters!'

const { createCasePreviewToken, isCasePreviewAuthorized } = await import('@/lib/preview')

test('preview token is bound to slug and expires check', async () => {
  const token = await createCasePreviewToken('demo-case')
  assert.ok(token)
  assert.equal(await isCasePreviewAuthorized(token, 'demo-case'), true)
  assert.equal(await isCasePreviewAuthorized(token, 'other-case'), false)
  assert.equal(await isCasePreviewAuthorized(process.env.REVALIDATE_SECRET, 'demo-case'), false)
})
