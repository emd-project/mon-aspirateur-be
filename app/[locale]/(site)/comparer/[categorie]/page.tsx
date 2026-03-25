// ISR 3600 — Comparateur par catégorie
import type { Metadata } from 'next'
import { getProductsByCategory, specsByCategory, categoryMeta, categoryOrder } from '@/lib/data/comparateur'
import { getTopPicksByCategory } from '@/lib/data/brands'
import type { ProductCategory } from '@/lib/data/types'
import CompareBar from '@/components/ui/CompareBar'
import ProductCTA from '@/components/ui/ProductCTA'
import { notFound } from 'next/navigation'

export const revalidate = 3600

type PageProps = { params: Promise<{ locale: string; categorie: string }> }

export async function generateStaticParams() {
  const locales = ['fr', 'en']
  return locales.flatMap((locale) =>
    categoryOrder.map((categorie) => ({ locale, categorie }))
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, categorie } = await params
  const category = categorie as ProductCategory
  if (!categoryMeta[category]) return {}
  const meta = categoryMeta[category]
  const label = locale === 'en' ? meta.labelEn : meta.label
  return {
    title: locale === 'fr'
      ? `Comparatif ${label} — mon-aspirateur.be`
      : `${label} comparison — mon-aspirateur.be`,
    description: meta.description,
    alternates: {
      canonical: `/${locale}/comparer/${categorie}`,
      languages: { fr: `/fr/comparer/${categorie}`, en: `/en/comparer/${categorie}` },
    },
  }
}

/** Returns the best spec key for the CompareBar (one per category). */
function getPrimarySpecKey(category: ProductCategory): string {
  const primaryKeys: Record<ProductCategory, string> = {
    balai: 'autonomie',
    robot: 'puissance',
    traineau: 'puissance',
    laveur: 'autonomie',
    accessoires: 'prix',
  }
  return primaryKeys[category]
}

function getPrimarySpecMax(category: ProductCategory): number {
  const maxVals: Record<ProductCategory, number> = {
    balai: 120,
    robot: 12000,
    traineau: 1200,
    laveur: 60,
    accessoires: 200,
  }
  return maxVals[category]
}

export default async function ComparerCategoriePage({ params }: PageProps) {
  const { locale, categorie } = await params
  const category = categorie as ProductCategory

  if (!categoryMeta[category]) notFound()

  const meta = categoryMeta[category]
  const label = locale === 'en' ? meta.labelEn : meta.label
  const products = getProductsByCategory(category)
  const topPicks = getTopPicksByCategory(category).slice(0, 3)
  const specs = specsByCategory[category]
  const primaryKey = getPrimarySpecKey(category)
  const primarySpecDef = specs.find((s) => s.key === primaryKey)
  const primaryMax = getPrimarySpecMax(category)

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: locale === 'fr' ? `Comparatif ${label}` : `${label} comparison`,
    url: `https://mon-aspirateur.be/${locale}/comparer/${categorie}`,
    numberOfItems: topPicks.length,
    itemListElement: topPicks.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: p.affiliateUrl,
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: `https://mon-aspirateur.be/${locale}` },
      { '@type': 'ListItem', position: 2, name: locale === 'fr' ? 'Comparer' : 'Compare', item: `https://mon-aspirateur.be/${locale}/comparer` },
      { '@type': 'ListItem', position: 3, name: label, item: `https://mon-aspirateur.be/${locale}/comparer/${categorie}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: 'var(--space-10)' }}>
        {/* Header */}
        <header style={{ marginBottom: 'var(--space-10)' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
            {locale === 'fr' ? 'Comparatif' : 'Comparison'}
          </p>
          <h1
            className="typo-h1-article"
            style={{ color: meta.color, marginBottom: 'var(--space-4)' }}
          >
            {label}
          </h1>
          <p className="typo-lead">{meta.description}</p>
        </header>

        {/* Products table */}
        <section aria-label={locale === 'fr' ? 'Tableau comparatif' : 'Comparison table'} style={{ marginBottom: 'var(--space-14)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {products.map((product) => {
              const rawVal = product.specs[primaryKey]
              const numVal = typeof rawVal === 'number' ? rawVal : 0
              const displayVal = typeof rawVal === 'boolean'
                ? (rawVal ? '✓' : '✗')
                : `${rawVal}${primarySpecDef?.unit ? '\u202F' + primarySpecDef.unit : ''}`

              return (
                <article
                  key={product.productId}
                  className="card"
                  style={{ padding: 'var(--space-5)', display: 'grid', gridTemplateColumns: '1fr auto auto auto', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}
                >
                  {/* Model + brand */}
                  <div>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                      {product.brandSlug}
                    </p>
                    <h2
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: 'var(--text-primary)',
                        margin: 0,
                        lineHeight: 1.3,
                      }}
                    >
                      {product.modelName}
                    </h2>
                    {primarySpecDef && (
                      <div style={{ marginTop: 'var(--space-3)', maxWidth: 280 }}>
                        <CompareBar
                          label={locale === 'en' ? primarySpecDef.labelEn : primarySpecDef.label}
                          value={numVal}
                          maxValue={primaryMax}
                          displayValue={displayVal}
                          category={category}
                          higherIsBetter={primarySpecDef.higherIsBetter}
                        />
                      </div>
                    )}
                  </div>

                  {/* Score badge */}
                  <div style={{ textAlign: 'center' }}>
                    <span
                      className="typo-score"
                      style={{
                        display: 'inline-block',
                        fontSize: '1.6rem',
                        fontWeight: 900,
                        color: meta.color,
                        lineHeight: 1,
                      }}
                    >
                      {product.score}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>/10</span>
                  </div>

                  {/* Price */}
                  <div style={{ textAlign: 'right' }}>
                    <span
                      className="typo-price"
                      style={{ fontSize: '1.5rem', color: 'var(--accent-1)' }}
                    >
                      {product.priceEur}&nbsp;€
                    </span>
                  </div>

                  {/* CTA */}
                  <div>
                    <a
                      href={product.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="btn btn-primary"
                      style={{ fontSize: '0.85rem' }}
                    >
                      {locale === 'fr' ? 'Voir' : 'View'}
                    </a>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        {/* Top 3 picks */}
        {topPicks.length > 0 && (
          <section aria-label={locale === 'fr' ? 'Notre sélection' : 'Our top picks'}>
            <h2 className="typo-h2" style={{ marginBottom: 'var(--space-6)' }}>
              {locale === 'fr' ? 'Notre sélection top 3' : 'Our top 3 picks'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
              {topPicks.map((pick) => (
                <ProductCTA
                  key={pick.name}
                  name={pick.name}
                  brand={pick.name.split(' ')[0] ?? ''}
                  priceEur={pick.priceEur}
                  score={pick.score}
                  highlight={pick.highlight}
                  affiliateUrl={pick.affiliateUrl}
                  category={category}
                  isTopPick={pick.isTopPick}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  )
}
