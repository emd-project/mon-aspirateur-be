import type { CSSProperties, ReactNode } from 'react'

type VerdictProps = {
  children: ReactNode
  title?: string
}

export default function Verdict({ children, title = 'Notre verdict' }: VerdictProps) {
  const wrapperStyle: CSSProperties = {
    borderTop: '2px solid var(--accent-1)',
    borderBottom: '2px solid var(--accent-1)',
    backgroundColor: 'var(--accent-1-soft)',
    padding: '1.25rem 1.5rem',
    margin: '2rem 0',
  }

  const titleStyle: CSSProperties = {
    fontFamily: 'var(--font-playfair, Georgia, serif)',
    fontWeight: 700,
    fontSize: '1.1rem',
    color: 'var(--accent-1)',
    marginBottom: '0.75rem',
    letterSpacing: '0.01em',
  }

  const contentStyle: CSSProperties = {
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    lineHeight: 1.65,
  }

  return (
    <aside className="verdict-box" style={wrapperStyle}>
      <p style={titleStyle}>{title}</p>
      <div style={contentStyle}>{children}</div>
    </aside>
  )
}
