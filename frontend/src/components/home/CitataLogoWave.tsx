'use client'

import { useId } from 'react'

const LOGO_W = 1663
const LOGO_H = 171

/** Horizontal slices of Citata.svg viewBox (Ц ' И Т А Т А). */
const LETTERS = [
  { id: 'ts', left: 0, width: 331 },
  { id: 'apos', left: 309, width: 69 },
  { id: 'i', left: 394, width: 297 },
  { id: 't1', left: 707, width: 265 },
  { id: 'a1', left: 929, width: 275 },
  { id: 't2', left: 1166, width: 265 },
  { id: 'a2', left: 1389, width: 274 },
] as const

function CitataGlyphs() {
  return (
    <>
      <path d="M0 170.772V0H114.332V138.025H177.611V0H291.943V135.577H324.042L330.767 170.772H0Z" fill="currentColor" />
      <path d="M394.961 170.772V0H509.48V90.8948L583.688 0H690.267V170.698H575.748V81.4075L502.456 170.772H394.961Z" fill="currentColor" />
      <path d="M309.347 61.6419V0.0287132L377.728 0.0287132V61.6419C376.939 73.5209 366.823 83.6536 348.636 101.777H330.167C337.92 78.1558 345.723 61.6419 335.336 61.6419H309.347Z" fill="currentColor" />
      <path d="M780.89 170.772V49.885H707.386L714.097 0H964.188L971.51 49.885H898.616V170.772H780.89Z" fill="currentColor" />
      <path d="M1240.05 170.772V49.885H1166.54L1173.26 0H1423.35L1430.67 49.885H1357.77V170.772H1240.05Z" fill="currentColor" />
      <path d="M1203.84 170.772H1076.2L1061.85 136.189H992.533L976.349 170.772H929.934L1013.6 0H1127.2L1203.84 170.772ZM1007.8 103.137H1048.41L1029.48 57.2295L1007.8 103.137Z" fill="currentColor" />
      <path d="M1663 170.772H1535.36L1521.01 136.189H1451.69L1435.51 170.772H1389.09L1472.76 0H1586.36L1663 170.772ZM1466.96 103.137H1507.57L1488.64 57.2295L1466.96 103.137Z" fill="currentColor" />
    </>
  )
}

type CitataLogoWaveProps = {
  className?: string
}

export function CitataLogoWave({ className }: CitataLogoWaveProps) {
  const uid = useId().replace(/:/g, '')

  return (
    <span className={['logo-wave', className].filter(Boolean).join(' ')} aria-hidden="true">
      {LETTERS.map((letter, index) => {
        const leftPct = (letter.left / LOGO_W) * 100
        const widthPct = (letter.width / LOGO_W) * 100
        return (
          <span
            key={letter.id}
            className="logo-wave__letter"
            data-letter={letter.id}
            data-index={index}
            style={{
              left: `${leftPct}%`,
              width: `${widthPct}%`,
            }}
          >
            <svg
              width={letter.width}
              height={LOGO_H}
              viewBox={`${letter.left} 0 ${letter.width} ${LOGO_H}`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <clipPath id={`citata-logo-clip-${uid}-${letter.id}`}>
                  <rect x={letter.left} y={0} width={letter.width} height={LOGO_H} fill="white" />
                </clipPath>
              </defs>
              <g clipPath={`url(#citata-logo-clip-${uid}-${letter.id})`}>
                <CitataGlyphs />
              </g>
            </svg>
          </span>
        )
      })}
    </span>
  )
}
