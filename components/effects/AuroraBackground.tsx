// effect-hero → aurora CSS animée 3 orbes + noise overlay SVG 0.04 · mémorable sans image
// DECISIONS.md: effect-hero

import type { CSSProperties } from 'react'

type AuroraBackgroundProps = {
  colors?: [string, string, string]
  speed?: 'slow' | 'medium' | 'fast'
  className?: string
  style?: CSSProperties
  children?: React.ReactNode
}

const DURATION: Record<NonNullable<AuroraBackgroundProps['speed']>, string> = {
  slow: '20s',
  medium: '12s',
  fast: '7s',
}

export default function AuroraBackground({
  colors = ['var(--aurora-1)', 'var(--aurora-2)', 'var(--aurora-3)'],
  speed = 'medium',
  className = '',
  style,
  children,
}: AuroraBackgroundProps) {
  const dur = DURATION[speed]
  const [c1, c2, c3] = colors

  return (
    <div
      className={className}
      style={{ position: 'relative', overflow: 'hidden', isolation: 'isolate', ...style }}
    >
      {/* Aurora orbes — CSS @keyframes uniquement, pas de JS */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        {/* Orbe 1 */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: '60%',
            height: '80%',
            borderRadius: '50%',
            background: `radial-gradient(ellipse at center, ${c1}33 0%, transparent 70%)`,
            animation: `aurora-move-1 ${dur} ease-in-out infinite`,
            willChange: 'transform',
          }}
        />
        {/* Orbe 2 */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            right: '-15%',
            width: '55%',
            height: '70%',
            borderRadius: '50%',
            background: `radial-gradient(ellipse at center, ${c2}2E 0%, transparent 70%)`,
            animation: `aurora-move-2 ${dur} ease-in-out infinite`,
            willChange: 'transform',
          }}
        />
        {/* Orbe 3 */}
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            left: '30%',
            width: '50%',
            height: '60%',
            borderRadius: '50%',
            background: `radial-gradient(ellipse at center, ${c3}40 0%, transparent 70%)`,
            animation: `aurora-move-3 ${dur} ease-in-out infinite`,
            willChange: 'transform',
          }}
        />

        {/* Noise overlay SVG */}
        <svg
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 'var(--noise-opacity)',
            pointerEvents: 'none',
          }}
        >
          <filter id="aurora-noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#aurora-noise)" />
        </svg>
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  )
}
