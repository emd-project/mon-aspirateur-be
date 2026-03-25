import Link from 'next/link'
import ScoreBadge from './ScoreBadge'
import type { Product, ProductCategory } from '@/lib/data/types'

type ProductCardProps = {
  product: Product
  locale: string
}

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  robot:       'Robot aspirateur',
  balai:       'Aspirateur balai',
  traineau:    'Aspirateur traîneau',
  laveur:      'Laveur de sol',
  accessoires: 'Accessoire',
}

export default function ProductCard({ product, locale }: ProductCardProps) {
  return (
    <article
      className="card card-lift"
      style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '.75rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="typo-overline" style={{ color: `var(--color-${product.category})` }}>
            {CATEGORY_LABEL[product.category]}
          </span>
          <h3 style={{
            margin: '.25rem 0 0',
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-playfair), Georgia, serif',
          }}>
            {product.brand} {product.name}
          </h3>
        </div>
        <ScoreBadge score={product.score} size="sm" />
      </div>

      <p style={{ margin: 0, fontSize: '.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        {product.excerpt}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.5rem', fontSize: '.8rem' }}>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block' }}>Prix</span>
          <strong style={{ color: 'var(--accent-1)' }}>{product.priceEur} €</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block' }}>Autonomie</span>
          <strong>{product.autonomyMin} min</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block' }}>Bruit</span>
          <strong>{product.noiseDb} dB</strong>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
        {product.hepaFilter && (
          <span className="badge badge-robot">HEPA</span>
        )}
        {product.petFriendly && (
          <span className="badge badge-balai">
            {locale === 'fr' ? 'Pour animaux' : 'Pet-friendly'}
          </span>
        )}
      </div>

      <Link
        href={`/${locale}/comparer/${product.category}`}
        style={{ marginTop: 'auto', color: 'var(--accent-1)', textDecoration: 'none', fontWeight: 600, fontSize: '.875rem' }}
      >
        {locale === 'fr' ? 'Comparer ce modèle' : 'Compare this model'} →
      </Link>
    </article>
  )
}
