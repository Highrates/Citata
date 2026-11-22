import assert from 'node:assert/strict'
import test from 'node:test'
import {
  kindFromSrc,
  serializeGallery,
  snapshotsEqualWithGallery,
  toGalleryFrames,
} from '@/components/admin/galleryHelpers'

test('kindFromSrc detects video by extension', () => {
  assert.equal(kindFromSrc('/x.mp4'), 'video')
  assert.equal(kindFromSrc('/x.jpg'), 'image')
  assert.equal(kindFromSrc('/x', 'video/webm'), 'video')
})

test('toGalleryFrames / serializeGallery round-trip without ids', () => {
  const frames = toGalleryFrames([{ src: '/a.jpg', alt: 'A', kind: 'image' }])
  assert.equal(frames.length, 1)
  assert.ok(frames[0].id)
  assert.deepEqual(serializeGallery(frames), [{ src: '/a.jpg', alt: 'A', kind: 'image' }])
})

test('snapshotsEqualWithGallery ignores frame ids', () => {
  const a = {
    title: 'T',
    gallery: [{ id: '1', src: '/a.jpg', alt: '', kind: 'image' as const }],
  }
  const b = {
    title: 'T',
    gallery: [{ id: '2', src: '/a.jpg', alt: '', kind: 'image' as const }],
  }
  assert.equal(snapshotsEqualWithGallery(a, b), true)
})
