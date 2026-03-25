import type { CSSProperties } from 'react'

// items: "label | produit | prix" séparés par " --- "
// ex: "Meilleur rapport qualité-prix | Rowenta X-Plorer Serie 75 | 299 € --- Budget serré | Eufy G40+ | 229 €"
type Props = {
  items: string
  label?: string
}

const split = (s: string) =>
  s.split('---').map(x => x.trim()).filter(Boolean)

export default function TLDRBox({ items, label = 'En bref' }: Props) {
  const rows = split(items).map(item => {
    const parts = item.split('|').map(x => x.trim())
    return { ctx: parts[0] ?? '', product: parts[1] ?? '', price: parts[2] ?? '' }
  })

  return (
    <aside
      aria-label={label}
      style={{
        border: '1px solid var(--border-light)',
        borderTop: '2px solid var(--accent-1)',
        borderRadius: '0 0 6px 6px',
        background: 'var(--bg-surface)',
        margin: '0 0 2rem',
        overflow: 'hidden',
      } as CSSProperties}
    >
      {/* En-tête */}
      <div style={{
        padding: '.65rem 1.25rem',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        gap: '.6rem',
        background: 'var(--accent-1-soft)',
      }}>
        <span style={{
          fontSize: '.65rem',
          fontWeight: 700,
          letterSpacing: '.16em',
          textTransform: 'uppercase',
          color: 'var(--accent-1)',
        }}>
          {label}
        </span>
      </div>

      {/* Lignes */}
      {rows.map((row, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'center',
            gap: '1rem',
            padding: '.85rem 1.25rem',
            borderBottom: i < rows.length - 1 ? '1px solid var(--border-light)' : 'none',
          }}
        >
          <div>
            {row.ctx && (
              <p style={{ margin: '0 0 .15rem', fontSize: '.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                {row.ctx}
              </p>
            )}
            {row.product && (
              <p style={{
                margin: 0,
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontWeight: 700,
                fontSize: '.95rem',
                color: 'var(--text-primary)',
                lineHeight: 1.3,
              }}>
                {row.product}
              </p>
            )}
          </div>
          {row.price && (
            <span style={{
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--accent-1)',
              whiteSpace: 'nowrap',
              letterSpacing: '-.01em',
            }}>
              {row.price}
            </span>
          )}
        </div>
      ))}
    </aside>
  )
}
