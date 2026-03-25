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
        <section aria-label={locale === 'fr' ? 'Tableau comparatif' : 'Comparison table'} style={{ marginBottom: '3rem' }}>
          <div style={{ border: '1px solid var(--border-light)', borderRadius: '6px', overflow: 'hidden' }}>
            {products.map((product, idx) => {
              const rawVal = product.specs[primaryKey]
              const numVal = typeof rawVal === 'number' ? rawVal : 0
              const displayVal = typeof rawVal === 'boolean'
                ? (rawVal ? '✓' : '✗')
                : `${rawVal}${primarySpecDef?.unit ? '\u202F' + primarySpecDef.unit : ''}`

              return (
                <article
                  key={product.productId}
                  style={{
                    padding: '1rem 1.25rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr 5rem 7rem',
                    alignItems: 'center',
                    gap: '1rem',
                    borderTop: idx > 0 ? '1px solid var(--border-light)' : 'none',
                    background: 'var(--bg-surface)',
                  }}
                >
                  {/* Model + brand + bar */}
                  <div>
                    <p style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 .2rem' }}>
                      {product.brandSlug}
                    </p>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.95rem', color: 'var(--text-primary)', margin: '0 0 .5rem', lineHeight: 1.3 }}>
                      {product.modelName}
                    </h2>
                    {primarySpecDef && (
                      <div style={{ maxWidth: 260 }}>
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

                  {/* Score + Price stacked */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '.8rem', fontWeight: 700, color: meta.color, fontVariantNumeric: 'tabular-nums' }}>
                      {product.score}<span style={{ fontSize: '.65rem', color: 'var(--text-muted)', fontWeight: 400 }}> /10</span>
                    </div>
                    <div style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--accent-1)', fontVariantNumeric: 'tabular-nums', marginTop: '.15rem' }}>
                      {product.priceEur}&nbsp;€
                    </div>
                  </div>

                  {/* CTA */}
                  <div style={{ textAlign: 'right' }}>
                    <a
                      href={product.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '.3rem',
                        fontSize: '.8rem',
                        fontWeight: 600,
                        color: 'var(--accent-1)',
                        textDecoration: 'none',
                        borderBottom: '1px solid var(--accent-1)',
                        paddingBottom: '1px',
                      }}
                    >
                      {locale === 'fr' ? 'Voir' : 'View'} →
                    </a>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        {/* Top 3 picks */}
        {topPicks.length > 0 && (
          <section aria-label={locale === 'fr' ? 'Notre sélection' : 'Our top picks'} style={{ paddingTop: '2rem', borderTop: '1px solid var(--border-light)' }}>
            <h2 className="typo-h2" style={{ marginBottom: '1.5rem' }}>
              {locale === 'fr' ? 'Notre sélection top 3' : 'Our top 3 picks'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
              {topPicks.map((pick) => (
                <ProductCTA
                  key={pick.name}
                  name={pick.name}
                  brand={pick.brandName}
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
