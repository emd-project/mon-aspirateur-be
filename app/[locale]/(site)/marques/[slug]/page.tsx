import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { brands, getBrand } from '@/lib/data/brands'
import type { BrandSlug } from '@/lib/data/brands'
import { categoryMeta } from '@/lib/data/comparateur'
import ProductCTA from '@/components/ui/ProductCTA'

export const revalidate = 3600

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams() {
  return (['fr', 'en'] as const).flatMap(locale =>
    brands.map(b => ({ locale, slug: b.slug }))
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const brand = getBrand(slug as BrandSlug)
  if (!brand) return {}
  return {
    title: `${brand.name} — Aspirateurs & Robots | Mon Aspirateur`,
    description: brand.positioning,
  }
}

export default async function MarqueDetailPage({ params }: Props) {
  const { locale, slug } = await params
  const brand = getBrand(slug as BrandSlug)
  if (!brand) notFound()

  const base = `/${locale}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Top produits ${brand.name}`,
    itemListElement: brand.topProducts.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: p.affiliateUrl === '#' ? `https://monaspirateur.fr${base}/marques/${slug}` : p.affiliateUrl,
    })),
  }

  return (
    <main id="main-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav aria-label="Fil d'Ariane" style={{ marginBottom: '2rem', fontSize: '.85rem', color: 'var(--text-muted)' }}>
        <a href={`${base}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Accueil</a>
        {' / '}
        <a href={`${base}/marques`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Marques</a>
        {' / '}
        <span style={{ color: 'var(--text-primary)' }}>{brand.name}</span>
      </nav>

      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '.75rem', flexWrap: 'wrap' }}>
          <h1
            className="typo-h1-article"
            style={{ margin: 0 }}
          >
            {brand.name}
          </h1>
          <span style={{ fontSize: '.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{brand.country}</span>
        </div>
        <p className="typo-lead" style={{ maxWidth: '600px' }}>{brand.positioning}</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '1rem' }}>
          {brand.categories.map(cat => (
            <a
              key={cat}
              href={`${base}/comparer/${cat}`}
              className={`badge badge-${cat}`}
              style={{ textDecoration: 'none' }}
            >
              {categoryMeta[cat].label}
            </a>
          ))}
        </div>
      </header>

      <section>
        <h2 className="typo-h2" style={{ marginBottom: '1.5rem' }}>Top produits {brand.name}</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}>
          {brand.topProducts.map(p => (
            <ProductCTA
              key={p.name}
              name={p.name}
              brand={brand.name}
              priceEur={p.priceEur}
              score={p.score}
              highlight={p.highlight}
              affiliateUrl={p.affiliateUrl}
              category={p.category}
              isTopPick={p.isTopPick}
            />
          ))}
        </div>
      </section>
    </main>
  )
}
