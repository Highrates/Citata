'use client'

import Image from 'next/image'
import { useState } from 'react'
import { MediaLightbox } from '@/components/media/MediaLightbox'
import type { GalleryItem } from '@/content/types'

type PageGalleryProps = {
  frames: GalleryItem[]
  label?: string
}

export function PageGallery({ frames, label = 'Галерея' }: PageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (!frames.length) return null

  return (
    <section className="page-gallery" aria-label={label}>
      <h2 className="page-gallery__label">{label}</h2>
      <ul className="page-gallery__grid">
        {frames.map((frame, index) => (
          <li key={`${frame.src}-${index}`} className="page-gallery__card">
            <button
              type="button"
              className="page-gallery__trigger"
              onClick={() => setLightboxIndex(index)}
              aria-label={
                frame.kind === 'video'
                  ? `Открыть видео: ${frame.alt || label}`
                  : `Открыть фото: ${frame.alt || label}`
              }
            >
              {frame.kind === 'video' ? (
                <video
                  className="page-gallery__media page-gallery__media--video"
                  src={frame.src}
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="metadata"
                  tabIndex={-1}
                />
              ) : (
                <Image
                  src={frame.src}
                  alt={frame.alt}
                  width={640}
                  height={480}
                  className="page-gallery__media"
                  sizes="(max-width: 720px) 50vw, (max-width: 960px) 33vw, 25vw"
                />
              )}
            </button>
          </li>
        ))}
      </ul>

      {lightboxIndex != null && frames[lightboxIndex] ? (
        <MediaLightbox
          frames={frames}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      ) : null}
    </section>
  )
}
