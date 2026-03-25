// @cdc 5.0 — Hub guides · ISR 3600s · JSON-LD BreadcrumbList
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { currentYear } from '@/lib/utils/year'
import { getGuides } from '@/lib/data/mock/guides'
import SectionDivider from '@/components/effects/SectionDivider'
import NoiseOverlay from '@/components/effects/NoiseOverlay'

export const revalidate = 3600

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'guides.meta' })
  const year = currentYear()
  return {
    title: t('title', { year }),
    description: t('description', { year }),
    alternates: { canonical: `/${locale}/guides` },
  }
}

export default async function GuidesHubPage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'guides' })
  const year = currentYear()
  const guides = getGuides(locale)

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: locale === 'fr' ? 'Accueil' : 'Home', item: `https://mon-aspirateur.be/${locale}` },
      { '@type': 'ListItem', position: 2, name: t('hub.title', { year }), item: `https://mon-aspirateur.be/${locale}/guides` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Hero — effect-categories bento */}
      <section style={{ position: 'relative', background: 'var(--bg-surface)', padding: 'var(--space-16) var(--space-10)', overflow: 'hidden' }}>
        <NoiseOverlay />
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <nav aria-label="Fil d'Ariane" style={{ marginBottom: 'var(--space-6)' }}>
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: 'var(--space-2)', fontSize: '13px', color: 'var(--text-muted)' }}>
              <li><Link href={`/${locale}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{locale === 'fr' ? 'Accueil' : 'Home'}</Link></li>
              <li aria-hidden="true">›</li>
              <li style={{ color: 'var(--accent-1)' }}>{locale === 'fr' ? 'Guides' : 'Guides'}</li>
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

      <SectionDivider variant="diagonal" fill="var(--bg-primary)" flipY />

      {/* Grid guides — effect-articles-grid */}
      <section style={{ background: 'var(--bg-primary)', padding: 'var(--space-12) var(--space-10)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {guides.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-16) 0' }}>
              {locale === 'fr' ? 'Aucun guide disponible.' : 'No guides available.'}
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
              {guides.map((guide) => (
                <article key={guide.slug} className="card-lift" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
                    <Link href={`/${locale}/guides/${guide.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {guide.title}
                    </Link>
                  </h2>
                  <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.65, flex: 1 }}>
                    {guide.excerpt}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', marginTop: 'auto' }}>
                    <time dateTime={guide.publishedAt}>
                      {new Date(guide.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-BE' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </time>
                    <span>{guide.readingTimeMin} min</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
