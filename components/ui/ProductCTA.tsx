function ctaLabel(url: string): string {
  if (!url || url === '#') return 'Voir le produit'
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    if (host.includes('amazon')) return 'Voir sur Amazon'
    const parts = host.split('.')
    const domain = parts.length >= 2 ? parts[parts.length - 2] : host
    return `Voir sur ${domain.charAt(0).toUpperCase() + domain.slice(1)}`
  } catch {
    return 'Voir le produit'
  }
}

type ProductCTAProps = {
  name: string
  brand: string
  priceEur: number
  score: number
  highlight: string
  affiliateUrl: string
  category: string
  isTopPick?: boolean
}

export default function ProductCTA({
  name,
  brand,
  priceEur,
  score,
  highlight,
  affiliateUrl,
  isTopPick = false,
}: ProductCTAProps) {
  return (
    <article
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: '6px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
      }}
    >
      {/* Top row — brand + score */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '.5rem',
      }}>
        <span style={{
          fontSize: '.72rem',
          fontWeight: 700,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: isTopPick ? 'var(--accent-1)' : 'var(--text-muted)',
        }}>
          {isTopPick ? `★ ${brand}` : brand}
        </span>
        <span style={{
          fontSize: '.8rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {score} / 10
        </span>
      </div>

      {/* Model name */}
      <h3 style={{
        fontFamily: 'var(--font-playfair), Georgia, serif',
        fontWeight: 700,
        fontSize: '1.05rem',
        color: 'var(--text-primary)',
        lineHeight: 1.3,
        margin: '0 0 .75rem',
      }}>
        {name}
      </h3>

      {/* Price */}
      <div style={{
        fontFamily: 'var(--font-playfair), Georgia, serif',
        fontWeight: 900,
        fontSize: '1.35rem',
        color: 'var(--accent-1)',
        lineHeight: 1,
        marginBottom: '.5rem',
        fontVariantNumeric: 'oldstyle-nums',
      }}>
        {priceEur} €
      </div>

      {/* Highlight */}
      <p style={{
        fontSize: '.875rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.55,
        margin: '0 0 .875rem',
      }}>
        {highlight}
      </p>

      {/* CTA */}
      <a
        href={affiliateUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '.4rem',
          fontSize: '.85rem',
          fontWeight: 600,
          color: 'var(--accent-1)',
          textDecoration: 'none',
          borderBottom: '1px solid var(--accent-1)',
          paddingBottom: '1px',
          width: 'fit-content',
        }}
      >
        {ctaLabel(affiliateUrl)} →
      </a>
    </article>
  )
}
