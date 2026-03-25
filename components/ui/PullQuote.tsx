import type { CSSProperties } from 'react'

type PullQuoteProps = {
  quote: string
  category?: string
}

export default function PullQuote({ quote, category }: PullQuoteProps) {
  const accentColor = category ? `var(--color-${category}, var(--accent-1))` : 'var(--accent-1)'

  const wrapperStyle: CSSProperties = {
    borderLeft: `4px solid ${accentColor}`,
    paddingLeft: '1.5rem',
    margin: '2rem 0',
    position: 'relative',
  }

  const markStyle: CSSProperties = {
    display: 'block',
    fontFamily: 'var(--font-playfair, Georgia, serif)',
    fontSize: '4rem',
    lineHeight: 0.8,
    color: accentColor,
    marginBottom: '0.25rem',
    userSelect: 'none',
    ariaHidden: 'true',
  } as CSSProperties

  const quoteStyle: CSSProperties = {
    fontFamily: 'var(--font-playfair, Georgia, serif)',
    fontStyle: 'italic',
    fontSize: '1.2rem',
    lineHeight: 1.6,
    color: 'var(--text-secondary)',
    margin: 0,
  }

  return (
    <blockquote className="pull-quote" style={wrapperStyle}>
      <span style={markStyle} aria-hidden="true">&ldquo;</span>
      <p style={quoteStyle}>{quote}</p>
    </blockquote>
  )
}
