import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { getTopPicksByCategory } from '@/lib/data/brands'
import { categoryOrder, categoryMeta } from '@/lib/data/comparateur'
import { brands } from '@/lib/data/brands'
import ProductCTA from '@/components/ui/ProductCTA'

export const dynamic = 'force-static'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home.meta' })
  return {
    title: t('title'),
    description: t('description'),
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Mon Aspirateur',
  description: 'Le guide aspirateur honnête — comparatifs, guides et outils pour choisir sans se tromper.',
  url: 'https://monaspirateur.fr',
  publisher: {
    '@type': 'Organization',
    name: 'Mon Aspirateur',
  },
}

const categoryIcons: Record<string, string> = {
  balai:       '🧹',
  robot:       '🤖',
  traineau:    '🏠',
  laveur:      '💧',
  accessoires: '🔧',
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const t    = await getTranslations({ locale, namespace: 'home' })
  const base = `/${locale}`

  // Top picks balai + robot pour la section coups de cœur
  const topBalai = getTopPicksByCategory('balai').slice(0, 2)
  const topRobot = getTopPicksByCategory('robot').slice(0, 2)
  const topPicks = [...topBalai, ...topRobot]

  // Top 6 marques
  const topBrands = brands.slice(0, 6)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section
        style={{
          background: 'var(--bg-primary)',
          padding: 'clamp(3rem, 8vw, 6rem) 1.5rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Cercle décoratif fond */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-120px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--accent-1-soft) 0%, transparent 70%)',
            opacity: .6,
            pointerEvents: 'none',
          }}
        />

        <div
          style={{ maxWidth: '720px', margin: '0 auto', position: 'relative' }}
          className="animate-fade-up"
        >
          <div
            className="typo-overline"
            style={{ marginBottom: '1rem', color: 'var(--accent-1)' }}
          >
            Le guide aspirateur honnête
          </div>

          <h1 className="typo-h1-home" style={{ marginBottom: '1.25rem' }}>
            {t('hero.headline')}
          </h1>

          <p className="typo-lead" style={{ marginBottom: '2rem' }}>
            {t('hero.subheadline')}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={`${base}/comparer/balai`} className="btn btn-primary" style={{ fontSize: '1rem', padding: '.75rem 1.75rem' }}>
              {t('hero.cta')}
            </Link>
            <Link href={`${base}/quiz`} className="btn btn-ghost" style={{ fontSize: '1rem', padding: '.75rem 1.75rem' }}>
              {t('hero.ctaSecondary')}
            </Link>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>

        {/* ── CATÉGORIES ────────────────────────────────────────── */}
        <section style={{ padding: '3rem 0' }}>
          <h2 className="typo-h2" style={{ marginBottom: '1.5rem' }}>
            {t('sections.categories')}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1rem',
          }}>
            {categoryOrder.map(cat => {
              const meta  = categoryMeta[cat]
              const color = `var(--color-${cat})`
              return (
                <Link
                  key={cat}
                  href={`${base}/comparer/${cat}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    className="card card-lift"
                    style={{
                      padding: '1.25rem',
                      borderTop: `3px solid ${color}`,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '1.75rem', marginBottom: '.5rem' }}>
                      {categoryIcons[cat] ?? '✦'}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-playfair), Georgia, serif',
                      fontWeight: 700,
                      fontSize: '.95rem',
                      color: 'var(--text-primary)',
                      marginBottom: '.25rem',
                    }}>
                      {meta.label}
                    </div>
                    <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {meta.description}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        <hr className="section-divider" />

        {/* ── TOP PICKS ─────────────────────────────────────────── */}
        <section style={{ padding: '3rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
            <h2 className="typo-h2">{t('sections.topPicks')}</h2>
            <Link href={`${base}/comparer/balai`} style={{ fontSize: '.875rem', color: 'var(--accent-1)', textDecoration: 'none' }}>
              Voir tous les comparatifs →
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}>
            {topPicks.map(p => (
              <ProductCTA
                key={p.name}
                name={p.name}
                brand={p.affiliateUrl}
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

        <hr className="section-divider" />

        {/* ── MARQUES ───────────────────────────────────────────── */}
        <section style={{ padding: '3rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
            <h2 className="typo-h2">{t('sections.marques')}</h2>
            <Link href={`${base}/marques`} style={{ fontSize: '.875rem', color: 'var(--accent-1)', textDecoration: 'none' }}>
              Toutes les marques →
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
          }}>
            {topBrands.map(brand => (
              <Link
                key={brand.slug}
                href={`${base}/marques/${brand.slug}`}
                style={{ textDecoration: 'none' }}
              >
                <div className="card card-lift" style={{ padding: '1.25rem' }}>
                  <div style={{
                    fontFamily: 'var(--font-playfair), Georgia, serif',
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    color: 'var(--text-primary)',
                    marginBottom: '.4rem',
                  }}>
                    {brand.name}
                    <span style={{ fontSize: '.75rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '.4rem', fontFamily: 'var(--font-inter)' }}>
                      {brand.country}
                    </span>
                  </div>
                  <p style={{ fontSize: '.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    {brand.positioning}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <hr className="section-divider" />

        {/* ── OUTILS ────────────────────────────────────────────── */}
        <section style={{ padding: '3rem 0' }}>
          <h2 className="typo-h2" style={{ marginBottom: '1.5rem' }}>
            {t('sections.comparer')}
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1rem',
          }}>
            {[
              {
                href: `${base}/quiz`,
                icon: '🎯',
                title: 'Quiz aspirateur',
                desc: '4 questions → votre recommandation personnalisée',
                cta: 'Faire le quiz',
                color: 'var(--color-balai)',
              },
              {
                href: `${base}/deals`,
                icon: '🏷️',
                title: 'Deals & Promos',
                desc: 'Sélection des meilleures promos du moment',
                cta: 'Voir les deals',
                color: 'var(--color-laveur)',
              },
              {
                href: `${base}/simulateur`,
                icon: '📅',
                title: 'Quand acheter ?',
                desc: 'Cycles de prix Amazon décryptés',
                cta: 'Voir le calendrier',
                color: 'var(--color-traineau)',
              },
            ].map(tool => (
              <Link key={tool.href} href={tool.href} style={{ textDecoration: 'none' }}>
                <div
                  className="card card-lift"
                  style={{ padding: '1.5rem', borderTop: `3px solid ${tool.color}` }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '.75rem' }}>{tool.icon}</div>
                  <div style={{
                    fontFamily: 'var(--font-playfair), Georgia, serif',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: 'var(--text-primary)',
                    marginBottom: '.4rem',
                  }}>
                    {tool.title}
                  </div>
                  <p style={{ fontSize: '.875rem', color: 'var(--text-secondary)', margin: '0 0 1rem', lineHeight: 1.5 }}>
                    {tool.desc}
                  </p>
                  <span style={{ fontSize: '.85rem', color: tool.color, fontWeight: 600 }}>
                    {tool.cta} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </>
  )
}
