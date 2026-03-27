'use client'

// ProductCTA — Bloc CTA produit pour articles de blog
// Usage:
//   <ProductCTA
//     name="Rowenta X-Clean 7"
//     price="349 €"
//     url="https://www.coolblue.be/..."
//     label="Voir sur Coolblue"
//     badge="Notre choix principal"
//     tag="Meilleur rapport qualité-prix"
//     description="Réservoir 0,6 L · Débit réglable · Compatible parquet stratifié"
//     sub="Livraison gratuite · Retour 30 jours"
//   />

type Props = {
  name: string
  url: string
  label: string
  price?: string
  badge?: string
  tag?: string
  description?: string
  sub?: string
}

export default function ProductCTA({ name, price, url, label, badge, tag, description, sub }: Props) {
  return (
    <aside
      aria-label={`Voir ${name}`}
      style={{
        position: 'relative',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(1.5rem, 4vw, 2.25rem)',
        margin: '2rem 0',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Barre accent en haut */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, var(--accent-1), var(--accent-2))',
      }} />

      {/* Badge */}
      {badge && (
        <div style={{ marginBottom: '0.75rem' }}>
          <span style={{
            display: 'inline-block',
            padding: '.3rem .875rem',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--accent-1-soft)',
            color: 'var(--accent-1)',
            fontSize: '.7rem',
            fontWeight: 700,
            letterSpacing: '.1em',
            textTransform: 'uppercase',
          }}>
            {badge}
          </span>
        </div>
      )}

      {/* Tag (vert) */}
      {tag && (
        <p style={{
          margin: '0 0 .5rem',
          fontSize: '.72rem',
          fontWeight: 700,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: 'var(--accent-2)',
        }}>
          {tag}
        </p>
      )}

      {/* Nom du produit */}
      <p style={{
        margin: '0 0 .5rem',
        fontFamily: 'var(--font-playfair), Georgia, serif',
        fontSize: 'clamp(1.4rem, 4vw, 2rem)',
        fontWeight: 700,
        color: 'var(--text-primary)',
        lineHeight: 1.2,
      }}>
        {name}
      </p>

      {/* Prix */}
      {price && (
        <p style={{
          margin: '0 0 .875rem',
          fontFamily: 'var(--font-playfair), Georgia, serif',
          fontSize: 'clamp(2rem, 6vw, 3rem)',
          fontWeight: 900,
          color: 'var(--accent-1)',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {price}
        </p>
      )}

      {/* Description */}
      {description && (
        <p style={{
          margin: '0 auto .75rem',
          maxWidth: '42ch',
          fontSize: '.875rem',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
        }}>
          {description}
        </p>
      )}

      {/* Bouton CTA */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '.5rem',
          padding: '.875rem 2rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--accent-1)',
          color: '#fff',
          fontWeight: 700,
          fontSize: '1rem',
          textDecoration: 'none',
          transition: 'background .15s, transform .15s',
          minWidth: '200px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--accent-1-hover)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--accent-1)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        {label} →
      </a>

      {/* Sous-note */}
      {sub && (
        <p style={{
          margin: '.75rem 0 0',
          fontSize: '.78rem',
          color: 'var(--text-muted)',
        }}>
          {sub}
        </p>
      )}
    </aside>
  )
}
