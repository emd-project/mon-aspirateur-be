import type { CSSProperties } from 'react'

type CompareBarProps = {
  label: string
  value: number
  maxValue?: number
  displayValue?: string
  category?: string
  higherIsBetter?: boolean
}

export default function CompareBar({
  label,
  value,
  maxValue = 100,
  displayValue,
  category,
  higherIsBetter = true,
}: CompareBarProps) {
  const pct = Math.min(100, Math.max(0, (value / maxValue) * 100))
  const barColor = category ? `var(--color-${category}, var(--accent-1))` : 'var(--accent-1)'

  const shown = displayValue ?? `${value}`

  const wrapperStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.35rem 0',
  }

  const labelStyle: CSSProperties = {
    flex: '0 0 140px',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.3,
  }

  const trackStyle: CSSProperties = {
    flex: 1,
    height: '8px',
    backgroundColor: 'var(--border-light)',
    borderRadius: 'var(--radius-pill)',
    overflow: 'hidden',
  }

  const fillStyle: CSSProperties = {
    height: '100%',
    width: `${pct}%`,
    backgroundColor: barColor,
    borderRadius: 'var(--radius-pill)',
    transition: 'width 0.4s ease',
    opacity: higherIsBetter ? 1 : 0.7,
  }

  const valueStyle: CSSProperties = {
    flex: '0 0 56px',
    textAlign: 'right',
    fontSize: '0.82rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  }

  return (
    <div style={wrapperStyle}>
      <span style={labelStyle}>{label}</span>
      <div style={trackStyle}>
        <div style={fillStyle} role="presentation" />
      </div>
      <span style={valueStyle}>{shown}</span>
    </div>
  )
}
