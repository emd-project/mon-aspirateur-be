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
  return { title: t('title'), description: t('description') }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Mon Aspirateur',
  description: 'Comparatifs aspirateurs, tests terrain et guides d\'achat — pour choisir sans se tromper.',
  url: 'https://monaspirateur.fr',
  publisher: { '@type': 'Organization', name: 'Mon Aspirateur' },
}

// ── Styles partagés ─────────────────────────────────────────────
const sectionStyle = {
  padding: '4rem 0',
} as const

const sectionHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: '1rem',
  marginBottom: '2rem',
  borderBottom: '1px solid var(--border-light)',
  paddingBottom: '.75rem',
} as const

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const t    = await getTranslations({ locale, namespace: 'home' })
  const base = `/${locale}`

  const topBalai = getTopPicksByCategory('balai').slice(0, 2)
  const topRobot = getTopPicksByCategory('robot').slice(0, 2)
  const topPicks = [...topBalai, ...topRobot]
  const topBrands = brands.slice(0, 6)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(4rem, 10vw, 7rem) 1.5rem clamp(3rem, 6vw, 5rem)',
          textAlign: 'center',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div style={{ maxWidth: '680px', margin: '0 auto' }} className="animate-fade-up">
          <p style={{
            fontSize: '.8rem',
            fontWeight: 600,
            letterSpacing: '.12em',
            textTransform: 'uppercase',
            color: 'var(--accent-1)',
            marginBottom: '1.25rem',
          }}>
            Aspirateurs — tests terrain
          </p>

          <h1
            className="typo-h1-home"
            style={{ marginBottom: '1.25rem' }}
          >
            {t('hero.headline')}
          </h1>

          <p
            className="typo-lead"
            style={{ marginBottom: '2.5rem', maxWidth: '560px', margin: '0 auto 2.5rem' }}
          >
            {t('hero.subheadline')}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href={`${base}/comparer/balai`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '.4rem',
                padding: '.75rem 1.75rem',
                background: 'var(--accent-1)',
                color: '#fff',
                borderRadius: '4px',
                fontWeight: 600,
                fontSize: '.95rem',
                textDecoration: 'none',
              }}
            >
              {t('hero.cta')}
            </Link>
            <Link
              href={`${base}/quiz`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '.4rem',
                padding: '.75rem 1.75rem',
                background: 'transparent',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '4px',
                fontWeight: 500,
                fontSize: '.95rem',
                textDecoration: 'none',
              }}
            >
              {t('hero.ctaSecondary')}
            </Link>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>

        {/* ── CATÉGORIES — liste éditoriale numérotée ────────────── */}
        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h2 className="typo-h2" style={{ margin: 0 }}>
              {t('sections.categories')}
            </h2>
          </div>

          <div>
            {categoryOrder.map((cat, i) => {
              const meta = categoryMeta[cat]
              return (
                <Link
                  key={cat}
                  href={`${base}/comparer/${cat}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2.5rem 1fr auto',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 0',
                    borderBottom: '1px solid var(--border-light)',
                    transition: 'background .12s',
                  }}>
                    {/* Numéro watermark */}
                    <span style={{
                      fontFamily: 'var(--font-playfair), Georgia, serif',
                      fontSize: '1.1rem',
                      fontWeight: 900,
                      color: 'var(--border-medium)',
                      lineHeight: 1,
                    }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    {/* Label + description */}
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-playfair), Georgia, serif',
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: 'var(--text-primary)',
                        marginBottom: '.15rem',
                      }}>
                        {meta.label}
                      </div>
                      <div style={{
                        fontSize: '.8rem',
                        color: 'var(--text-muted)',
                      }}>
                        {meta.description}
                      </div>
                    </div>

                    {/* Flèche */}
                    <span style={{ fontSize: '.9rem', color: 'var(--text-muted)' }}>→</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── TOP PICKS ───────────────────────────────────────────── */}
        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h2 className="typo-h2" style={{ margin: 0 }}>{t('sections.topPicks')}</h2>
            <Link
              href={`${base}/comparer/balai`}
              style={{ fontSize: '.875rem', color: 'var(--accent-1)', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              Voir tous →
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1rem',
          }}>
            {topPicks.map(p => (
              <ProductCTA
                key={p.name}
                name={p.name}
                brand={p.brandName}
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

        {/* ── MARQUES ─────────────────────────────────────────────── */}
        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h2 className="typo-h2" style={{ margin: 0 }}>{t('sections.marques')}</h2>
            <Link
              href={`${base}/marques`}
              style={{ fontSize: '.875rem', color: 'var(--accent-1)', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              Toutes les marques →
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '.75rem',
          }}>
            {topBrands.map(brand => (
              <Link
                key={brand.slug}
                href={`${base}/marques/${brand.slug}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  padding: '1rem',
                  border: '1px solid var(--border-light)',
                  borderRadius: '6px',
                  background: 'var(--bg-surface)',
                  transition: 'border-color .15s, box-shadow .15s',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-playfair), Georgia, serif',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: 'var(--text-primary)',
                    marginBottom: '.25rem',
                  }}>
                    {brand.name}
                    <span style={{ fontSize: '.72rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '.4rem' }}>
                      {brand.country}
                    </span>
                  </div>
                  <p style={{ fontSize: '.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                    {brand.positioning}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── OUTILS ──────────────────────────────────────────────── */}
        <section style={{ ...sectionStyle, paddingBottom: '5rem' }}>
          <div style={sectionHeaderStyle}>
            <h2 className="typo-h2" style={{ margin: 0 }}>{t('sections.comparer')}</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '.75rem',
          }}>
            {[
              { href: `${base}/quiz`,       title: 'Quiz aspirateur',   desc: '4 questions → recommandation', cta: 'Faire le quiz' },
              { href: `${base}/deals`,      title: 'Deals & Promos',    desc: 'Sélection promos du moment',   cta: 'Voir les deals' },
              { href: `${base}/simulateur`, title: 'Quand acheter ?',   desc: 'Calendrier prix Amazon',       cta: 'Voir le calendrier' },
            ].map(tool => (
              <Link
                key={tool.href}
                href={tool.href}
                style={{
                  display: 'block',
                  padding: '1.25rem',
                  border: '1px solid var(--border-light)',
                  borderRadius: '6px',
                  background: 'var(--bg-surface)',
                  textDecoration: 'none',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  fontWeight: 700,
                  fontSize: '.95rem',
                  color: 'var(--text-primary)',
                  marginBottom: '.3rem',
                }}>
                  {tool.title}
                </div>
                <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', margin: '0 0 .75rem', lineHeight: 1.5 }}>
                  {tool.desc}
                </p>
                <span style={{ fontSize: '.82rem', color: 'var(--accent-1)', fontWeight: 600 }}>
                  {tool.cta} →
                </span>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </>
  )
}
