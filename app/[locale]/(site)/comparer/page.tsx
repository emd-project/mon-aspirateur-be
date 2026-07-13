// Hub comparateur — index des catégories réellement disponibles.
// Alimenté par content/products/*.yaml (fiches réelles). Aucune donnée mock.
import type { Metadata } from 'next'
import Link from 'next/link'
import { categoryOrder, categoryMeta } from '@/lib/data/comparateur'
import { getAllCmsProducts } from '@/lib/content/products'
import type { ProductCategory } from '@/lib/data/types'

export const revalidate = 3600

type Props = { params: Promise<{ locale: string }> }

const BASE_URL = 'https://www.mon-aspirateur.be'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'fr'
      ? 'Comparateur aspirateurs — toutes les catégories | Mon Aspirateur'
      : 'Vacuum comparator — all categories | Mon Aspirateur',
    description: locale === 'fr'
      ? 'Comparez les aspirateurs côte-à-côte : robots, balais, traîneaux, laveurs. Puissance, autonomie, bruit, prix relevés en Belgique.'
      : 'Compare vacuum cleaners side by side: robots, cordless sticks, canisters, floor washers. Power, battery, noise and Belgian prices.',
    alternates: {
      canonical: `/${locale}/comparer`,
      languages: { fr: '/fr/comparer', en: '/en/comparer' },
    },
  }
}

/** Catégories qui ont au moins une fiche produit réelle. */
function getAvailableCategories() {
  const products = getAllCmsProducts()

  return categoryOrder
    .map((cat: ProductCategory) => {
      const inCat = products.filter(p => p.category === cat)
      if (inCat.length === 0) return null

      const prices = inCat.map(p => p.priceEur)
      const brands = [...new Set(inCat.map(p => p.brand))].sort()
      const best = [...inCat].sort((a, b) => b.rating - a.rating)[0]

      return {
        slug: cat,
        meta: categoryMeta[cat],
        count: inCat.length,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        brands,
        best,
      }
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)
}

export default async function ComparerHubPage({ params }: Props) {
  const { locale } = await params
  const base = `/${locale}`
  const categories = getAvailableCategories()

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: locale === 'fr' ? 'Comparateurs aspirateurs par catégorie' : 'Vacuum comparators by category',
    url: `${BASE_URL}/${locale}/comparer`,
    numberOfItems: categories.length,
    itemListElement: categories.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: locale === 'en' ? c.meta.labelEn : c.meta.label,
      url: `${BASE_URL}/${locale}/comparer/${c.slug}`,
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: locale === 'fr' ? 'Accueil' : 'Home', item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: locale === 'fr' ? 'Comparer' : 'Compare', item: `${BASE_URL}/${locale}/comparer` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <main id="main-content" style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem' }}>

        <header style={{ marginBottom: '2.5rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-light)' }}>
          <p className="typo-overline" style={{ color: 'var(--accent-1)', marginBottom: '.5rem' }}>
            {locale === 'fr' ? 'Comparateur' : 'Comparator'}
          </p>
          <h1 className="typo-h1-article" style={{ marginBottom: '.75rem' }}>
            {locale === 'fr' ? 'Comparer les aspirateurs' : 'Compare vacuum cleaners'}
          </h1>
          <p className="typo-lead" style={{ maxWidth: '58ch' }}>
            {locale === 'fr'
              ? 'Choisissez une catégorie pour voir tous les modèles côte-à-côte : puissance, autonomie, bruit et prix relevés en Belgique.'
              : 'Pick a category to see every model side by side: power, battery life, noise and Belgian prices.'}
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {categories.map(cat => {
            const label = locale === 'en' ? cat.meta.labelEn : cat.meta.label
            return (
              <Link
                key={cat.slug}
                href={`${base}/comparer/${cat.slug}`}
                style={{ textDecoration: 'none', display: 'flex' }}
              >
                <article style={{
                  width: '100%',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-light)',
                  borderTop: `3px solid ${cat.meta.color}`,
                  borderRadius: '6px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '.75rem',
                }}>
                  <h2 style={{
                    fontFamily: 'var(--font-playfair), Georgia, serif',
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    color: cat.meta.color,
                    margin: 0,
                  }}>
                    {label}
                  </h2>

                  <p style={{ fontSize: '.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.55, flex: 1 }}>
                    {cat.meta.description}
                  </p>

                  {/* Chiffres issus des fiches réelles */}
                  <dl style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '.5rem 1rem',
                    margin: 0,
                    paddingTop: '.75rem',
                    borderTop: '1px solid var(--border-light)',
                  }}>
                    <div>
                      <dt style={{ fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted)', fontWeight: 700 }}>
                        {locale === 'fr' ? 'Modèles' : 'Models'}
                      </dt>
                      <dd style={{ margin: 0, fontWeight: 700, fontSize: '.95rem', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                        {cat.count}
                      </dd>
                    </div>
                    <div>
                      <dt style={{ fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted)', fontWeight: 700 }}>
                        {locale === 'fr' ? 'Prix' : 'Price'}
                      </dt>
                      <dd style={{ margin: 0, fontWeight: 700, fontSize: '.95rem', color: 'var(--accent-1)', fontVariantNumeric: 'tabular-nums' }}>
                        {cat.minPrice}&nbsp;–&nbsp;{cat.maxPrice}&nbsp;€
                      </dd>
                    </div>
                  </dl>

                  {cat.best && (
                    <p style={{ fontSize: '.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                      {locale === 'fr' ? 'Mieux noté : ' : 'Top rated: '}
                      <strong style={{ color: 'var(--text-secondary)' }}>{cat.best.name}</strong>
                      {' '}({cat.best.rating}/10)
                    </p>
                  )}

                  <span style={{ fontSize: '.85rem', color: 'var(--accent-1)', fontWeight: 600 }}>
                    {locale === 'fr' ? 'Comparer' : 'Compare'} →
                  </span>
                </article>
              </Link>
            )
          })}
        </div>

        {categories.length === 0 && (
          <p style={{ color: 'var(--text-muted)' }}>
            {locale === 'fr' ? 'Aucune catégorie disponible.' : 'No category available.'}
          </p>
        )}

      </main>
    </>
  )
}
