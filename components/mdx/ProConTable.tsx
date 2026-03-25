type ProConTableProps = {
  pros: string[]
  cons: string[]
  proTitle?: string
  conTitle?: string
}

export default function ProConTable({
  pros,
  cons,
  proTitle = 'Pour',
  conTitle = 'Contre',
}: ProConTableProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1px',
      background: 'var(--border-light)',
      border: '1px solid var(--border-light)',
      borderRadius: '6px',
      overflow: 'hidden',
      margin: '1.5rem 0',
    }}>
      {/* Pro header */}
      <div style={{ background: 'var(--accent-2-soft)', padding: '.6rem 1rem' }}>
        <span style={{
          fontSize: '.72rem',
          fontWeight: 700,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: 'var(--accent-2)',
        }}>
          {proTitle}
        </span>
      </div>
      {/* Con header */}
      <div style={{ background: 'var(--accent-1-soft)', padding: '.6rem 1rem' }}>
        <span style={{
          fontSize: '.72rem',
          fontWeight: 700,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: 'var(--accent-1)',
        }}>
          {conTitle}
        </span>
      </div>
      {/* Rows */}
      <ul style={{ background: 'var(--bg-surface)', margin: 0, padding: '1rem 1rem 1rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '.4rem', listStyle: 'none' }}>
        {pros.map((p, i) => (
          <li key={i} style={{ fontSize: '.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: 'flex', gap: '.5rem' }}>
            <span style={{ color: 'var(--accent-2)', flexShrink: 0, fontWeight: 700 }}>+</span>
            {p}
          </li>
        ))}
      </ul>
      <ul style={{ background: 'var(--bg-surface)', margin: 0, padding: '1rem 1rem 1rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '.4rem', listStyle: 'none' }}>
        {cons.map((c, i) => (
          <li key={i} style={{ fontSize: '.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: 'flex', gap: '.5rem' }}>
            <span style={{ color: 'var(--accent-1)', flexShrink: 0, fontWeight: 700 }}>−</span>
            {c}
          </li>
        ))}
      </ul>
    </div>
  )
}
