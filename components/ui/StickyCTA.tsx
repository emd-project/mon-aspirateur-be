'use client'

import { useState, useEffect, CSSProperties } from 'react'

type StickyCTAProps = {
  productName: string
  priceEur: number
  affiliateUrl: string
  showAfterPx?: number
}

export default function StickyCTA({
  productName,
  priceEur,
  affiliateUrl,
  showAfterPx = 400,
}: StickyCTAProps) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > showAfterPx)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [showAfterPx])

  if (dismissed || !visible) return null

  const barStyle: CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 1.25rem',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    backgroundColor: 'color-mix(in srgb, var(--bg-surface) 85%, transparent)',
    borderTop: '1px solid var(--border-light)',
    boxShadow: 'var(--shadow-md)',
    flexWrap: 'wrap',
  }

  const nameStyle: CSSProperties = {
    flex: 1,
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    minWidth: 0,
  }

  const priceStyle: CSSProperties = {
    fontSize: '1.1rem',
    fontWeight: 800,
    color: 'var(--accent-1)',
    whiteSpace: 'nowrap',
  }

  const dismissStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    fontSize: '1.1rem',
    lineHeight: 1,
    padding: '4px 6px',
    borderRadius: 'var(--radius-md)',
    flexShrink: 0,
  }

  return (
    <div className="sticky-cta" style={barStyle} role="complementary" aria-label="Offre produit">
      <span style={nameStyle}>{productName}</span>
      <span style={priceStyle}>{priceEur}&nbsp;€</span>
      <a
        href={affiliateUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="btn-primary"
        style={{ flexShrink: 0, fontSize: '0.88rem', padding: '0.5rem 1rem' }}
      >
        Voir sur Amazon →
      </a>
      <button
        style={dismissStyle}
        onClick={() => setDismissed(true)}
        aria-label="Fermer"
      >
        ×
      </button>
    </div>
  )
}
