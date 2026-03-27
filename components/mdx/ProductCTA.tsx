'use client'

// ProductCTA — Encart produit inline dans un article de blog
// Layout horizontal compact : bordure gauche accent, nom + détails, prix + lien
// Usage: <ProductCTA name="Rowenta X-Clean 7" price="349 €" url="..." label="Voir sur Coolblue" />

type Props = {
  name: string
  url: string
  label: string
  price?: string
  badge?: string
  description?: string
  sub?: string
  // tag et badge fusionnés — badge affiché si présent
  tag?: string
}

export default function ProductCTA({ name, price, url, label, badge, tag, description, sub }: Props) {
  const pill = badge ?? tag

  return (
    <aside
      aria-label={`Voir ${name}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.25rem',
        borderLeft: '3px solid var(--accent-1)',
        background: 'var(--bg-surface)',
        borderRadius: '0 var(--radius-md) var(--radius-md) 0',
        padding: '1rem 1.25rem',
        margin: '1.75rem 0',
      }}
    >
      {/* Infos produit */}
      <div style={{ minWidth: 0 }}>
        {pill && (
          <p style={{
            margin: '0 0 .25rem',
            fontSize: '.68rem',
            fontWeight: 700,
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            color: 'var(--accent-1)',
          }}>
            {pill}
          </p>
        )}
        <p style={{
          margin: 0,
          fontFamily: 'var(--font-playfair), Georgia, serif',
          fontSize: '1.05rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.3,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {name}
        </p>
        {description && (
          <p style={{
            margin: '.25rem 0 0',
            fontSize: '.8rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
          }}>
            {description}
          </p>
        )}
        {sub && (
          <p style={{
            margin: '.2rem 0 0',
            fontSize: '.75rem',
            color: 'var(--text-muted)',
            fontStyle: 'italic',
          }}>
            {sub}
          </p>
        )}
      </div>

      {/* Prix + lien */}
      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        {price && (
          <p style={{
            margin: '0 0 .5rem',
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1,
          }}>
            {price}
          </p>
        )}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '.3rem',
            padding: '.45rem .9rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--accent-1)',
            color: 'var(--accent-1)',
            background: 'transparent',
            fontWeight: 600,
            fontSize: '.82rem',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            transition: 'background .15s, color .15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--accent-1)'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--accent-1)'
          }}
        >
          {label} →
        </a>
      </div>
    </aside>
  )
}
