// Props: pipe-separated strings e.g. pros="A | B | C" cons="X | Y"
type ProConTableProps = {
  pros: string   // "item1 | item2 | item3"
  cons: string   // "item1 | item2"
  proTitle?: string
  conTitle?: string
}

const split = (s: string) => s.split('|').map(x => x.trim()).filter(Boolean)

export default function ProConTable({
  pros,
  cons,
  proTitle = 'Pour',
  conTitle = 'Contre',
}: ProConTableProps) {
  const proList = split(pros)
  const conList = split(cons)

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
      <ul style={{ background: 'var(--bg-surface)', margin: 0, padding: '1rem 1rem 1rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '.4rem', listStyle: 'none' }}>
        {proList.map((p, i) => (
          <li key={i} style={{ fontSize: '.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: 'flex', gap: '.5rem' }}>
            <span style={{ color: 'var(--accent-2)', flexShrink: 0, fontWeight: 700 }}>+</span>
            {p}
          </li>
        ))}
      </ul>
      <ul style={{ background: 'var(--bg-surface)', margin: 0, padding: '1rem 1rem 1rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '.4rem', listStyle: 'none' }}>
        {conList.map((c, i) => (
          <li key={i} style={{ fontSize: '.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: 'flex', gap: '.5rem' }}>
            <span style={{ color: 'var(--accent-1)', flexShrink: 0, fontWeight: 700 }}>−</span>
            {c}
          </li>
        ))}
      </ul>
    </div>
  )
}
