// SectionDivider — SVG géométrique entre sections
// Variants : wave · diagonal · none

type SectionDividerProps = {
  variant?: 'wave' | 'diagonal' | 'none'
  fill?: string
  className?: string
  flipY?: boolean
}

export default function SectionDivider({
  variant = 'diagonal',
  fill = 'var(--bg-primary)',
  className = '',
  flipY = false,
}: SectionDividerProps) {
  if (variant === 'none') return null

  const transform = flipY ? 'scaleY(-1)' : undefined

  if (variant === 'diagonal') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className={className}
        style={{ display: 'block', width: '100%', height: '60px', transform }}
      >
        <polygon points="0,60 1440,0 1440,60" fill={fill} />
      </svg>
    )
  }

  // wave
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 60"
      preserveAspectRatio="none"
      className={className}
      style={{ display: 'block', width: '100%', height: '60px', transform }}
    >
      <path
        d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z"
        fill={fill}
      />
    </svg>
  )
}
