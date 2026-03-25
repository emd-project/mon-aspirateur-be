// Noise texture overlay — SVG inline, aria-hidden, purely decorative

type NoiseOverlayProps = {
  opacity?: number
  className?: string
}

export default function NoiseOverlay({ opacity = 0.04, className = '' }: NoiseOverlayProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <filter id="noise-filter">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="3"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise-filter)" />
    </svg>
  )
}
