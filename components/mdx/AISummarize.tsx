import type { CSSProperties } from 'react'

type Props = {
  points: string[]
  question?: string
}

const wrapperStyle: CSSProperties = {
  borderLeft: '3px solid var(--text-muted)',
  background: 'var(--bg-surface)',
  padding: '1rem 1.25rem',
  margin: '0 0 2rem',
}

const labelStyle: CSSProperties = {
  fontSize: '.7rem',
  fontWeight: 700,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  marginBottom: '.6rem',
}

const listStyle: CSSProperties = {
  margin: 0,
  padding: '0 0 0 1.1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '.35rem',
}

const itemStyle: CSSProperties = {
  fontSize: '.875rem',
  color: 'var(--text-secondary)',
  lineHeight: 1.5,
}

export default function AISummarize({ points, question }: Props) {
  return (
    <aside aria-label="Résumé pour assistants IA" style={wrapperStyle}>
      <p style={labelStyle}>Résumé · Points clés</p>
      {question && (
        <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: '.5rem', fontStyle: 'italic' }}>
          {question}
        </p>
      )}
      <ul style={listStyle}>
        {points.map((point, i) => (
          <li key={i} style={itemStyle}>{point}</li>
        ))}
      </ul>
    </aside>
  )
}
