type WarningProps = { children: React.ReactNode; title?: string }

export default function Warning({ children, title = 'Attention' }: WarningProps) {
  return (
    <aside style={{
      background: 'var(--accent-1-soft)',
      borderLeft: '3px solid var(--accent-1)',
      borderRadius: '0 4px 4px 0',
      padding: '1rem 1.25rem',
      margin: '1.5rem 0',
    }}>
      <p style={{
        margin: '0 0 .35rem',
        fontSize: '.72rem',
        fontWeight: 700,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        color: 'var(--accent-1)',
      }}>
        {title}
      </p>
      <div style={{ fontSize: '.9rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
        {children}
      </div>
    </aside>
  )
}
