import assert from 'node:assert/strict'
import test from 'node:test'
import { isVideoMedia } from '@/lib/media-kind'

test('isVideoMedia respects explicit kind', () => {
  assert.equal(isVideoMedia('https://cdn.example/a.jpg', 'video'), true)
  assert.equal(isVideoMedia('https://cdn.example/a.mp4', 'image'), false)
})

test('isVideoMedia detects video extensions', () => {
  assert.equal(isVideoMedia('https://cdn.example/a.mp4'), true)
  assert.equal(isVideoMedia('https://cdn.example/a.webm?x=1'), true)
  assert.equal(isVideoMedia('https://cdn.example/a.jpg'), false)
})
