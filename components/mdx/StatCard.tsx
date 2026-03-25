type StatCardProps = {
  value: string
  label: string
  sub?: string
}

export default function StatCard({ value, label, sub }: StatCardProps) {
  return (
    <div style={{
      display: 'inline-flex',
      flexDirection: 'column',
      gap: '.25rem',
      padding: '1.25rem 1.5rem',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-light)',
      borderRadius: '6px',
      minWidth: '140px',
    }}>
      <span style={{
        fontFamily: 'var(--font-playfair), Georgia, serif',
        fontWeight: 900,
        fontSize: 'clamp(2rem, 5vw, 3rem)',
        lineHeight: 1,
        color: 'var(--accent-1)',
        fontVariantNumeric: 'oldstyle-nums',
      }}>
        {value}
      </span>
      <span style={{
        fontSize: '.8rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        letterSpacing: '.03em',
      }}>
        {label}
      </span>
      {sub && (
        <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{sub}</span>
      )}
    </div>
  )
}
