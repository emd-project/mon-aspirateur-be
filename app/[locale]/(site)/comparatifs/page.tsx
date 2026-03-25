// @cdc 5.0 — Hub comparatifs · ISR 3600s · JSON-LD BreadcrumbList
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { currentYear } from '@/lib/utils/year'
import { getComparatifs } from '@/lib/data/mock/comparatifs'
import SectionDivider from '@/components/effects/SectionDivider'
import NoiseOverlay from '@/components/effects/NoiseOverlay'

export const revalidate = 3600

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'comparatifs.meta' })
  const year = currentYear()
  return {
    title: t('title', { year }),
    description: t('description', { year }),
    alternates: { canonical: `/${locale}/comparatifs` },
  }
}

export default async function ComparatifsHubPage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'comparatifs' })
  const year = currentYear()
  const comparatifs = getComparatifs(locale)

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: locale === 'fr' ? 'Accueil' : 'Home', item: `https://mon-aspirateur.be/${locale}` },
      { '@type': 'ListItem', position: 2, name: t('hub.title', { year }), item: `https://mon-aspirateur.be/${locale}/comparatifs` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Hero — effect-comparateur */}
      <section style={{ position: 'relative', background: 'var(--bg-surface-2)', overflow: 'hidden', padding: 'var(--space-16) var(--space-10)' }}>
        <NoiseOverlay />
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <nav aria-label="Fil d'Ariane" style={{ marginBottom: 'var(--space-6)' }}>
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: 'var(--space-2)', fontSize: '13px', color: 'var(--text-muted)' }}>
              <li><Link href={`/${locale}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{locale === 'fr' ? 'Accueil' : 'Home'}</Link></li>
              <li aria-hidden="true">›</li>
              <li style={{ color: 'var(--accent-1)' }}>{locale === 'fr' ? 'Comparatifs' : 'Comparisons'}</li>
            </ol>
          </nav>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 var(--space-4)', lineHeight: 1.1 }}>
            {t('hub.title', { year })}
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', margin: 0, maxWidth: 600, lineHeight: 1.7 }}>
            {t('hub.subtitle')}
          </p>
        </div>
      </section>

      <SectionDivider variant="wave" fill="var(--bg-primary)" />

      {/* Grid glassmorphism */}
      <section style={{ background: 'var(--bg-primary)', padding: 'var(--space-12) var(--space-10)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
          {comparatifs.map((comp) => (
            <article key={comp.slug} className="card-lift glass" style={{ borderRadius: 'var(--radius-lg)', padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Brands */}
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                <span style={{ padding: '4px 14px', background: 'var(--accent-1)', color: '#fff', borderRadius: 'var(--radius-full)', fontSize: '13px', fontWeight: 700 }}>
                  {comp.brandA}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700 }}>vs</span>
                <span style={{ padding: '4px 14px', background: 'var(--bg-surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', fontSize: '13px', fontWeight: 700 }}>
                  {comp.brandB}
                </span>
              </div>

              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
                <Link href={`/${locale}/comparatifs/${comp.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {comp.title}
                </Link>
              </h2>

              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.65, flex: 1 }}>
                {comp.excerpt}
              </p>

              <div style={{ paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {t('verdict')} :
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginLeft: 'var(--space-2)' }}>
                  {comp.verdict}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)' }}>
                <time dateTime={comp.publishedAt}>
                  {new Date(comp.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-BE' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                </time>
                <span>{comp.readingTimeMin} min</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
