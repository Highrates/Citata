import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ADMIN_UPLOAD_MAX_BYTES,
  validateAdminUploadFile,
} from '@/lib/admin/upload-limits'

test('rejects oversized and disallowed mime', () => {
  assert.equal(
    validateAdminUploadFile({ type: 'application/pdf', size: 100, name: 'a.pdf' }),
    'Допустимы изображения (JPEG/PNG/WebP/GIF/AVIF/SVG) и видео (MP4/WebM/MOV)',
  )
  assert.match(
    validateAdminUploadFile({
      type: 'image/jpeg',
      size: ADMIN_UPLOAD_MAX_BYTES + 1,
      name: 'big.jpg',
    }) || '',
    /МБ/,
  )
})

test('allows image and video mime', () => {
  assert.equal(validateAdminUploadFile({ type: 'image/png', size: 10, name: 'a.png' }), null)
  assert.equal(validateAdminUploadFile({ type: 'video/mp4', size: 10, name: 'a.mp4' }), null)
})
