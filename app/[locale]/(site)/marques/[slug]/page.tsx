import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllBrands, getBrandBySlug } from '@/lib/content/brands'
import { getAllCmsProducts } from '@/lib/content/products'
import { categoryMeta } from '@/lib/data/comparateur'
import ProductCTA from '@/components/ui/ProductCTA'
import type { ProductCategory } from '@/lib/data/types'

export const revalidate = 3600

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams() {
  const brands = getAllBrands()
  return (['fr', 'en'] as const).flatMap(locale =>
    brands.map(b => ({ locale, slug: b.slug }))
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const brand = getBrandBySlug(slug)
  if (!brand) return {}
  return {
    title: `${brand.name} — Aspirateurs & Robots | Mon Aspirateur`,
    description: brand.positioning,
  }
}

export default async function MarqueDetailPage({ params }: Props) {
  const { locale, slug } = await params
  const brand = getBrandBySlug(slug)
  if (!brand) return notFound()

  const base = `/${locale}`
  const products = getAllCmsProducts().filter(p => p.brandSlug === slug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Top produits ${brand.name}`,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: p.affiliateUrl && p.affiliateUrl !== '#'
        ? p.affiliateUrl
        : `https://mon-aspirateur.be${base}/marques/${slug}`,
    })),
  }

  const categories = [...new Set(products.map(p => p.category))]

  return (
    <main id="main-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Fil d'Ariane" style={{ marginBottom: '2rem', fontSize: '.85rem', color: 'var(--text-muted)' }}>
        <a href={`${base}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Accueil</a>
        {' / '}
        <a href={`${base}/marques`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Marques</a>
        {' / '}
        <span style={{ color: 'var(--text-primary)' }}>{brand.name}</span>
      </nav>

      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '.75rem', flexWrap: 'wrap' }}>
          <h1 className="typo-h1-article" style={{ margin: 0 }}>{brand.name}</h1>
          <span style={{ fontSize: '.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{brand.country}</span>
        </div>
        <p className="typo-lead" style={{ maxWidth: '600px' }}>{brand.positioning}</p>

        {categories.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '1rem' }}>
            {categories.map(cat => (
              <a
                key={cat}
                href={`${base}/comparer/${cat}`}
                className={`badge badge-${cat}`}
                style={{ textDecoration: 'none' }}
              >
                {categoryMeta[cat as ProductCategory]?.label ?? cat}
              </a>
            ))}
          </div>
        )}
      </header>

      <section>
        <h2 className="typo-h2" style={{ marginBottom: '1.5rem' }}>
          Quels sont les meilleurs produits {brand.name} ?
        </h2>
        {products.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Aucun produit disponible pour cette marque pour l'instant.</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}>
            {products
              .sort((a, b) => b.rating - a.rating)
              .map(p => (
                <ProductCTA
                  key={p.slug}
                  name={p.name}
                  brand={p.brand || brand.name}
                  priceEur={p.priceEur}
                  score={p.rating}
                  highlight={p.description}
                  affiliateUrl={p.affiliateUrl || '#'}
                  category={p.category}
                />
              ))}
          </div>
        )}
      </section>
    </main>
  )
}
