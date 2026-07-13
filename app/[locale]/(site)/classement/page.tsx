// Hub classements — index des classements disponibles.
// Les items proviennent de content/data/classements.json, hydratés avec les
// fiches réelles de content/products/*.yaml. Zero donnée mock, zero prix inventé.
import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllClassements } from '@/lib/content/classements'

export const revalidate = 3600

type Props = { params: Promise<{ locale: string }> }

const BASE_URL = 'https://www.mon-aspirateur.be'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'fr'
      ? 'Classement aspirateurs — nos meilleurs modèles | Mon Aspirateur'
      : 'Vacuum cleaner rankings — our best models | Mon Aspirateur',
    description: locale === 'fr'
      ? 'Nos classements aspirateurs : robots, balais, toutes catégories. Modèles réels, prix relevés en Belgique, verdict sans langue de bois.'
      : 'Our vacuum cleaner rankings: robots, cordless sticks, all categories. Real models, Belgian prices, no-nonsense verdicts.',
    alternates: {
      canonical: `/${locale}/classement`,
      languages: { fr: '/fr/classement', en: '/en/classement' },
    },
  }
}

export default async function ClassementHubPage({ params }: Props) {
  const { locale } = await params
  const base = `/${locale}`
  const classements = getAllClassements()

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: locale === 'fr' ? 'Classements aspirateurs' : 'Vacuum cleaner rankings',
    url: `${BASE_URL}/${locale}/classement`,
    numberOfItems: classements.length,
    itemListElement: classements.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.title,
      url: `${BASE_URL}/${locale}/classement/${c.slug}`,
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: locale === 'fr' ? 'Accueil' : 'Home', item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: locale === 'fr' ? 'Classement' : 'Ranking', item: `${BASE_URL}/${locale}/classement` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <main id="main-content" style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem' }}>

        <header style={{ marginBottom: '2.5rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-light)' }}>
          <p className="typo-overline" style={{ color: 'var(--accent-1)', marginBottom: '.5rem' }}>
            {locale === 'fr' ? 'Classements' : 'Rankings'}
          </p>
          <h1 className="typo-h1-article" style={{ marginBottom: '.75rem' }}>
            {locale === 'fr' ? 'Nos classements aspirateurs' : 'Our vacuum cleaner rankings'}
          </h1>
          <p className="typo-lead" style={{ maxWidth: '58ch' }}>
            {locale === 'fr'
              ? 'Des modèles réels, un prix relevé, un lien marchand vérifiable. Si on ne peut pas sourcer un modèle, il n’est pas dans le classement.'
              : 'Real models, a listed price, a verifiable merchant link. If we cannot source a model, it is not in the ranking.'}
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {classements.map(c => (
            <Link key={c.slug} href={`${base}/classement/${c.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
              <article style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                borderLeft: '4px solid var(--accent-1)',
                borderRadius: '0 6px 6px 0',
                padding: '1.5rem 1.75rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
                  <h2 style={{
                    fontFamily: 'var(--font-playfair), Georgia, serif',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    color: 'var(--text-primary)',
                    margin: '0 0 .5rem',
                  }}>
                    {c.title}
                  </h2>
                  <span style={{ fontSize: '.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {c.items.length} {locale === 'fr' ? 'modèles' : 'models'}
                  </span>
                </div>

                <p style={{ fontSize: '.9rem', color: 'var(--text-secondary)', margin: '0 0 1rem', lineHeight: 1.6 }}>
                  {c.intro}
                </p>

                {/* Podium : 3 premiers, données issues des fiches produit */}
                <ol style={{ listStyle: 'none', margin: '0 0 1rem', padding: 0, display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                  {c.items.slice(0, 3).map(item => (
                    <li key={item.productSlug} style={{ display: 'flex', alignItems: 'baseline', gap: '.6rem', fontSize: '.85rem' }}>
                      <span style={{
                        fontFamily: 'var(--font-playfair), Georgia, serif',
                        fontWeight: 900,
                        color: 'var(--border-medium)',
                        minWidth: '1.2rem',
                      }}>
                        {item.rank}
                      </span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.product.name}</span>
                      <span style={{ color: 'var(--accent-1)', fontWeight: 700, fontVariantNumeric: 'tabular-nums', marginLeft: 'auto' }}>
                        {item.product.priceEur}&nbsp;€
                      </span>
                    </li>
                  ))}
                </ol>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>
                    {locale === 'fr' ? 'Prix relevés le ' : 'Prices checked on '}
                    <time dateTime={c.updated}>{c.updated}</time>
                  </span>
                  <span style={{ fontSize: '.85rem', color: 'var(--accent-1)', fontWeight: 600 }}>
                    {locale === 'fr' ? 'Voir le classement complet' : 'See the full ranking'} →
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {classements.length === 0 && (
          <p style={{ color: 'var(--text-muted)' }}>
            {locale === 'fr' ? 'Aucun classement disponible.' : 'No ranking available.'}
          </p>
        )}

      </main>
    </>
  )
}
