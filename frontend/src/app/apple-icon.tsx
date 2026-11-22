import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ebe8de',
        }}
      >
        <svg width="96" height="140" viewBox="0 0 26 38" fill="none">
          <path
            d="M0 23.0106L0 0L26 0V23.0106C25.7 27.447 21.8536 31.2313 14.9388 38H7.91615C10.864 29.178 13.8309 23.0106 9.88179 23.0106H0Z"
            fill="#E93323"
          />
        </svg>
      </div>
    ),
    { ...size },
  )
}
