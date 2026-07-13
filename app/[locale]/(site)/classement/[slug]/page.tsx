// Page money — classement détaillé.
// Chaque ligne est une fiche réelle de content/products/*.yaml : nom, marque,
// prix et URL marchande viennent du YAML, jamais du JSON éditorial.
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getClassement, getClassementSlugs } from '@/lib/content/classements'
import { categoryMeta } from '@/lib/data/comparateur'

export const revalidate = 3600

type Props = { params: Promise<{ locale: string; slug: string }> }

const BASE_URL = 'https://www.mon-aspirateur.be'
const LOCALES = ['fr', 'en'] as const

export async function generateStaticParams() {
  const slugs = getClassementSlugs()
  return LOCALES.flatMap(locale => slugs.map(slug => ({ locale, slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const c = getClassement(slug)
  if (!c) return {}

  return {
    title: `${c.title} — Mon Aspirateur`,
    description: c.intro.slice(0, 155),
    alternates: {
      canonical: `/${locale}/classement/${slug}`,
      languages: {
        fr: `/fr/classement/${slug}`,
        en: `/en/classement/${slug}`,
      },
    },
  }
}

/** Domaine lisible d'une URL marchande, pour citer la source. */
function sourceHost(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

export default async function ClassementDetailPage({ params }: Props) {
  const { locale, slug } = await params
  const c = getClassement(slug)
  if (!c) notFound()

  const base = `/${locale}`
  const accent = c.category ? categoryMeta[c.category]?.color ?? 'var(--accent-1)' : 'var(--accent-1)'

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: c.title,
    url: `${BASE_URL}/${locale}/classement/${c.slug}`,
    numberOfItems: c.items.length,
    itemListElement: c.items.map(item => ({
      '@type': 'ListItem',
      position: item.rank,
      item: {
        '@type': 'Product',
        name: item.product.name,
        brand: { '@type': 'Brand', name: item.product.brand },
        offers: {
          '@type': 'Offer',
          price: item.product.priceEur,
          priceCurrency: 'EUR',
          url: item.product.affiliateUrl,
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: c.faq.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: locale === 'fr' ? 'Accueil' : 'Home', item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: locale === 'fr' ? 'Classement' : 'Ranking', item: `${BASE_URL}/${locale}/classement` },
      { '@type': 'ListItem', position: 3, name: c.title, item: `${BASE_URL}/${locale}/classement/${c.slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <main id="main-content" style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Header */}
        <header style={{ marginBottom: '2rem' }}>
          <p className="typo-overline" style={{ color: accent, marginBottom: '.5rem' }}>
            <Link href={`${base}/classement`} style={{ color: 'inherit', textDecoration: 'none' }}>
              {locale === 'fr' ? 'Classement' : 'Ranking'}
            </Link>
            {' — '}{c.label}
          </p>
          <h1 className="typo-h1-article" style={{ marginBottom: '.75rem' }}>{c.title}</h1>
          <p className="typo-lead" style={{ maxWidth: '60ch' }}>{c.intro}</p>
          <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
            {locale === 'fr' ? 'Prix relevés le ' : 'Prices checked on '}
            <time dateTime={c.updated}>{c.updated}</time>
            {' — '}
            {locale === 'fr'
              ? 'le prix qui fait foi est celui de la page marchande liée sur chaque ligne.'
              : 'the price that counts is the one on the merchant page linked on each row.'}
          </p>
        </header>

        {/* TL;DR */}
        {c.tldr.length > 0 && (
          <section className="tip-box" style={{ marginBottom: '2.5rem', display: 'block' }}>
            <p style={{
              margin: '0 0 .6rem',
              fontSize: '.72rem',
              fontWeight: 700,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}>
              {locale === 'fr' ? 'En bref' : 'In brief'}
            </p>
            <ul style={{ margin: 0, padding: '0 0 0 1.15rem', display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
              {c.tldr.map((line, i) => (
                <li key={i} style={{ fontSize: '.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{line}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Critères */}
        {c.criteria.length > 0 && (
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 className="typo-h2" style={{ marginBottom: '.75rem' }}>
              {locale === 'fr' ? 'Nos critères' : 'Our criteria'}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
              {c.criteria.map(crit => (
                <span key={crit} style={{
                  fontSize: '.75rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '.25rem .7rem',
                }}>
                  {crit}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Le classement */}
        <section aria-label={locale === 'fr' ? 'Classement' : 'Ranking'} style={{ marginBottom: '3rem' }}>
          <h2 className="typo-h2" style={{ marginBottom: '1.25rem' }}>
            {locale === 'fr' ? 'Le classement' : 'The ranking'}
          </h2>

          <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {c.items.map(item => {
              const p = item.product
              const host = sourceHost(p.affiliateUrl)

              return (
                <li key={item.productSlug}>
                  <article style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-light)',
                    borderTop: item.rank === 1 ? `3px solid ${accent}` : '1px solid var(--border-light)',
                    borderRadius: '6px',
                    padding: '1.5rem 1.75rem',
                  }}>

                    {/* En-tête ligne */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '.75rem' }}>
                      <span aria-hidden="true" style={{
                        fontFamily: 'var(--font-playfair), Georgia, serif',
                        fontWeight: 900,
                        fontSize: '2rem',
                        lineHeight: 1,
                        color: item.rank === 1 ? accent : 'var(--border-medium)',
                        minWidth: '2rem',
                      }}>
                        {item.rank}
                      </span>

                      <div style={{ flex: 1, minWidth: '12rem' }}>
                        <p style={{
                          fontSize: '.7rem',
                          fontWeight: 700,
                          letterSpacing: '.1em',
                          textTransform: 'uppercase',
                          color: 'var(--text-muted)',
                          margin: '0 0 .2rem',
                        }}>
                          {p.brand}
                        </p>
                        <h3 style={{
                          fontFamily: 'var(--font-playfair), Georgia, serif',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          color: 'var(--text-primary)',
                          margin: '0 0 .35rem',
                          lineHeight: 1.3,
                        }}>
                          {p.name}
                        </h3>
                        <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '.68rem',
                            fontWeight: 700,
                            letterSpacing: '.06em',
                            textTransform: 'uppercase',
                            color: accent,
                            background: 'var(--accent-1-soft)',
                            borderRadius: '3px',
                            padding: '.15rem .5rem',
                          }}>
                            {item.badge}
                          </span>
                          <span style={{
                            fontSize: '.68rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            background: 'var(--bg-subtle)',
                            borderRadius: '3px',
                            padding: '.15rem .5rem',
                          }}>
                            {item.bestFor}
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                          {p.rating}<span style={{ fontWeight: 400 }}>/10</span>
                        </div>
                        <div style={{
                          fontFamily: 'var(--font-playfair), Georgia, serif',
                          fontWeight: 900,
                          fontSize: '1.35rem',
                          color: 'var(--accent-1)',
                          fontVariantNumeric: 'tabular-nums',
                        }}>
                          {p.priceEur}&nbsp;€
                        </div>
                      </div>
                    </div>

                    {/* Verdict */}
                    <p style={{ fontSize: '.9rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: '0 0 1rem' }}>
                      {item.verdict}
                    </p>

                    {/* Specs réelles issues du YAML */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1rem' }}>
                      {p.autonomyMin !== null && (
                        <span style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                          {locale === 'fr' ? 'Autonomie' : 'Battery'}{' '}
                          <strong style={{ color: 'var(--text-secondary)' }}>{p.autonomyMin}&nbsp;min</strong>
                        </span>
                      )}
                      {p.noiseDb !== null && (
                        <span style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                          {locale === 'fr' ? 'Bruit' : 'Noise'}{' '}
                          <strong style={{ color: 'var(--text-secondary)' }}>{p.noiseDb}&nbsp;dB</strong>
                        </span>
                      )}
                      {p.weightKg !== null && (
                        <span style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                          {locale === 'fr' ? 'Poids' : 'Weight'}{' '}
                          <strong style={{ color: 'var(--text-secondary)' }}>{p.weightKg}&nbsp;kg</strong>
                        </span>
                      )}
                    </div>

                    {/* CTA + source */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', paddingTop: '.75rem', borderTop: '1px solid var(--border-light)' }}>
                      <a
                        href={p.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="btn btn-primary"
                        style={{ fontSize: '.85rem', padding: '.5rem 1rem' }}
                      >
                        {locale === 'fr' ? 'Voir le prix' : 'Check price'} →
                      </a>

                      {host && (
                        <span style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>
                          {locale === 'fr' ? 'Source : ' : 'Source: '}
                          <a
                            href={p.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}
                          >
                            {host}
                          </a>
                          {' — '}
                          <time dateTime={c.updated}>{c.updated}</time>
                        </span>
                      )}
                    </div>

                  </article>
                </li>
              )
            })}
          </ol>
        </section>

        {/* Méthodo */}
        <section style={{ marginBottom: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-light)' }}>
          <h2 className="typo-h2" style={{ marginBottom: '.75rem' }}>
            {locale === 'fr' ? 'Méthodologie' : 'Methodology'}
          </h2>
          <p style={{ fontSize: '.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            {c.methodology}
          </p>
        </section>

        {/* FAQ */}
        {c.faq.length > 0 && (
          <section style={{ paddingTop: '2rem', borderTop: '1px solid var(--border-light)' }}>
            <h2 className="typo-h2" style={{ marginBottom: '1.25rem' }}>
              {locale === 'fr' ? 'Questions fréquentes' : 'Frequently asked questions'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {c.faq.map((f, i) => (
                <div key={i}>
                  <h3 style={{
                    fontFamily: 'var(--font-playfair), Georgia, serif',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: 'var(--text-primary)',
                    margin: '0 0 .35rem',
                  }}>
                    {f.q}
                  </h3>
                  <p style={{ fontSize: '.9rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
                    {f.a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Liens internes */}
        <nav style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <Link href={`${base}/classement`} style={{ fontSize: '.875rem', color: 'var(--accent-1)', fontWeight: 600, textDecoration: 'none' }}>
            ← {locale === 'fr' ? 'Tous les classements' : 'All rankings'}
          </Link>
          {c.category && (
            <Link href={`${base}/comparer/${c.category}`} style={{ fontSize: '.875rem', color: 'var(--accent-1)', fontWeight: 600, textDecoration: 'none' }}>
              {locale === 'fr' ? 'Comparer tous les modèles' : 'Compare every model'} →
            </Link>
          )}
          {c.category && (
            <Link href={`${base}/choisir/${c.category}`} style={{ fontSize: '.875rem', color: 'var(--accent-1)', fontWeight: 600, textDecoration: 'none' }}>
              {locale === 'fr' ? "Guide d'achat" : 'Buying guide'} →
            </Link>
          )}
        </nav>

      </main>
    </>
  )
}
