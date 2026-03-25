import type { CSSProperties } from 'react'

type StatCardProps = {
  value: string | number
  unit?: string
  label: string
  sublabel?: string
  category?: string
}

export default function StatCard({ value, unit, label, sublabel, category }: StatCardProps) {
  const accentColor = category ? `var(--color-${category}, var(--accent-1))` : 'var(--accent-1)'

  const cardStyle: CSSProperties = {
    borderTop: `3px solid ${accentColor}`,
  }

  const valueStyle: CSSProperties = {
    fontFamily: 'var(--font-playfair, Georgia, serif)',
    fontWeight: 900,
    fontSize: '3rem',
    lineHeight: 1,
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
  }

  const unitStyle: CSSProperties = {
    fontFamily: 'var(--font-playfair, Georgia, serif)',
    fontWeight: 700,
    fontSize: '1.25rem',
    color: accentColor,
    marginLeft: '4px',
    verticalAlign: 'baseline',
  }

  const labelStyle: CSSProperties = {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    fontWeight: 500,
    marginTop: '0.5rem',
    lineHeight: 1.4,
  }

  const sublabelStyle: CSSProperties = {
    color: 'var(--text-muted)',
    fontSize: '0.78rem',
    marginTop: '0.25rem',
    lineHeight: 1.3,
  }

  return (
    <div className="card" style={cardStyle}>
      <div>
        <span style={valueStyle}>{value}</span>
        {unit && <span style={unitStyle}>{unit}</span>}
      </div>
      <p style={labelStyle}>{label}</p>
      {sublabel && <p style={sublabelStyle}>{sublabel}</p>}
    </div>
  )
}
