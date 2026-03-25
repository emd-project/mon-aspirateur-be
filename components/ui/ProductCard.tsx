import Link from 'next/link'
import ScoreBadge from './ScoreBadge'
import type { Product } from '@/lib/data/types'

type ProductCardProps = {
  product: Product
  locale: string
}

const TYPE_LABEL: Record<Product['type'], string> = {
  robot: 'Robot aspirateur',
  balai: 'Aspirateur balai',
  traineau: 'Aspirateur traîneau',
  'sans-fil': 'Aspirateur sans fil',
}

export default function ProductCard({ product, locale }: ProductCardProps) {
  return (
    <article
      className="card-lift"
      style={{
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        padding: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        transition: 'border-color 0.2s var(--ease-out)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 600,
            }}
          >
            {TYPE_LABEL[product.type]}
          </span>
          <h3
            style={{
              margin: 'var(--space-1) 0 0',
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
            }}
          >
            {product.brand} {product.name}
          </h3>
        </div>
        <ScoreBadge score={product.score} size="sm" />
      </div>

      <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        {product.excerpt}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-2)',
          fontSize: '13px',
        }}
      >
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block' }}>Prix</span>
          <strong style={{ color: 'var(--text-primary)' }}>{product.priceEur} €</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block' }}>Autonomie</span>
          <strong style={{ color: 'var(--text-primary)' }}>{product.autonomyMin} min</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block' }}>Bruit</span>
          <strong style={{ color: 'var(--text-primary)' }}>{product.noiseDb} dB</strong>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        {product.hepaFilter && (
          <span
            style={{
              fontSize: '12px',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(42,122,75,0.1)',
              color: 'var(--success)',
              fontWeight: 600,
            }}
          >
            HEPA
          </span>
        )}
        {product.petFriendly && (
          <span
            style={{
              fontSize: '12px',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(204,74,26,0.1)',
              color: 'var(--accent-1)',
              fontWeight: 600,
            }}
          >
            {locale === 'fr' ? 'Pour animaux' : 'Pet-friendly'}
          </span>
        )}
      </div>

      <Link
        href={`/${locale}/guides`}
        style={{
          marginTop: 'auto',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          color: 'var(--accent-1)',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '14px',
        }}
      >
        {locale === 'fr' ? 'Voir le guide' : 'See the guide'} →
      </Link>
    </article>
  )
}
