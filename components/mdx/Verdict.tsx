type VerdictProps = { children: React.ReactNode; title?: string }

export default function Verdict({ children, title = 'Notre verdict' }: VerdictProps) {
  return (
    <aside style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-light)',
      borderLeft: '3px solid var(--accent-1)',
      borderRadius: '0 4px 4px 0',
      padding: '1.25rem 1.5rem',
      margin: '2rem 0',
    }}>
      <p style={{
        margin: '0 0 .5rem',
        fontFamily: 'var(--font-playfair), Georgia, serif',
        fontWeight: 700,
        fontSize: '1rem',
        color: 'var(--text-primary)',
      }}>
        {title}
      </p>
      <div style={{ fontSize: '.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        {children}
      </div>
    </aside>
  )
}
