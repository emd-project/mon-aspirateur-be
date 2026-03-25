import type { CSSProperties } from 'react'

type ProductCTAProps = {
  name: string
  brand: string
  priceEur: number
  score: number
  highlight: string
  affiliateUrl: string
  category: string
  isTopPick?: boolean
}

export default function ProductCTA({
  name,
  brand,
  priceEur,
  score,
  highlight,
  affiliateUrl,
  category,
  isTopPick = false,
}: ProductCTAProps) {
  const categoryVar = `var(--color-${category}, var(--accent-1))`

  const wrapperStyle: CSSProperties = {
    position: 'relative',
    borderTop: `3px solid ${categoryVar}`,
  }

  const topPickStyle: CSSProperties = {
    display: 'inline-block',
    backgroundColor: 'var(--accent-1-soft)',
    color: 'var(--accent-1)',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    padding: '3px 10px',
    borderRadius: 'var(--radius-pill)',
    marginBottom: '0.75rem',
  }

  const overlineStyle: CSSProperties = {
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: '0.25rem',
  }

  const priceStyle: CSSProperties = {
    fontSize: '2.25rem',
    fontWeight: 900,
    color: 'var(--accent-1)',
    lineHeight: 1,
    fontFamily: 'var(--font-playfair, Georgia, serif)',
  }

  const scoreStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: categoryVar,
    color: '#fff',
    fontSize: '0.8rem',
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: 'var(--radius-pill)',
  }

  return (
    <div className="card" style={wrapperStyle}>
      {isTopPick && <div style={topPickStyle}>Coup de cœur</div>}
      <p style={overlineStyle}>{brand}</p>
      <h3 style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
        {name}
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <span style={priceStyle}>{priceEur}&nbsp;€</span>
        <span style={scoreStyle}>★ {score}/10</span>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.25rem', lineHeight: 1.55 }}>
        {highlight}
      </p>
      <a
        href={affiliateUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="btn-primary"
      >
        Voir sur Amazon →
      </a>
    </div>
  )
}
