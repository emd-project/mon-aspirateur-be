// @cdc 5.0 — Home · SSG · JSON-LD WebSite
// effect-hero → aurora CSS + noise + H1 clip-text

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { currentYear } from '@/lib/utils/year'
import AuroraBackground from '@/components/effects/AuroraBackground'
import AnimatedHeading from '@/components/effects/AnimatedHeading'
import SectionDivider from '@/components/effects/SectionDivider'
import { getGuides } from '@/lib/data/mock/guides'
import { getComparatifs } from '@/lib/data/mock/comparatifs'
import { getArticles } from '@/lib/data/mock/articles'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home.meta' })
  const year = currentYear()
  return {
    title: t('title', { year }),
    description: t('description', { year }),
    alternates: {
      canonical: `/${locale}`,
      languages: { fr: '/fr', en: '/en' },
    },
  }
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home' })
  const tCommon = await getTranslations({ locale, namespace: 'common' })
  const year = currentYear()

  const guides = getGuides(locale)
  const comparatifs = getComparatifs(locale)
  const articles = getArticles(locale)

  // JSON-LD WebSite + SearchAction
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'mon-aspirateur.be',
    url: 'https://mon-aspirateur.be',
    description: tCommon('tagline'),
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `https://mon-aspirateur.be/${locale}?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      {/* ── HERO — effect-hero ── */}
      <AuroraBackground
        style={{
          background: 'var(--bg-primary)',
          padding: 'var(--space-16) var(--space-10)',
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
        } as React.CSSProperties}
      >
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <AnimatedHeading
            text={t('hero.headline')}
            variant="home"
            animationDelay="0.1s"
          />

          <p
            className="animate-fade-up"
            style={{
              fontSize: 'clamp(17px, 2vw, 20px)',
              color: 'var(--text-secondary)',
              margin: 'var(--space-6) auto var(--space-10)',
              maxWidth: 600,
              lineHeight: 1.7,
              animationDelay: '0.25s',
            }}
          >
            {t('hero.subheadline')}
          </p>

          <div
            className="animate-fade-up"
            style={{
              display: 'flex',
              gap: 'var(--space-4)',
              justifyContent: 'center',
              flexWrap: 'wrap',
              animationDelay: '0.4s',
            }}
          >
            <Link
              href={`/${locale}/guides`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-4) var(--space-8)',
                background: 'var(--accent-1)',
                color: '#fff',
                borderRadius: 'var(--radius-full)',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '16px',
                boxShadow: 'var(--shadow-accent)',
                transition: 'transform 0.15s var(--ease-out)',
              }}
            >
              {t('hero.cta', { year })}
            </Link>

            <Link
              href={`/${locale}/outils/quiz`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-4) var(--space-8)',
                background: 'transparent',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-full)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '15px',
                transition: 'border-color 0.15s var(--ease-out)',
              }}
            >
              {t('hero.ctaSecondary')}
            </Link>
          </div>
        </div>
      </AuroraBackground>

      <SectionDivider variant="diagonal" fill="var(--bg-surface)" flipY />

      {/* ── GUIDES HUB ── */}
      <section
        style={{
          background: 'var(--bg-surface)',
          padding: 'var(--space-16) var(--space-10)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-8)' }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(24px, 3vw, 36px)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              {t('sections.guides')}
            </h2>
            <Link href={`/${locale}/guides`} style={{ fontSize: '14px', color: 'var(--accent-1)', textDecoration: 'none', fontWeight: 600 }}>
              {tCommon('readMore')} →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
            {guides.slice(0, 3).map((guide) => (
              <article
                key={guide.slug}
                className="card-lift"
                style={{
                  background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  padding: 'var(--space-6)',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    margin: '0 0 var(--space-3)',
                    lineHeight: 1.3,
                  }}
                >
                  <Link href={`/${locale}/guides/${guide.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {guide.title}
                  </Link>
                </h3>
                <p style={{ margin: '0 0 var(--space-4)', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {guide.excerpt}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <time dateTime={guide.publishedAt}>
                    {new Date(guide.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-BE' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </time>
                  <span>{guide.readingTimeMin} min</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider variant="wave" fill="var(--bg-primary)" flipY />

      {/* ── OUTILS — effect-tools-section ── */}
      <section
        style={{
          position: 'relative',
          background: 'var(--text-primary)',
          padding: 'var(--space-16) var(--space-10)',
          overflow: 'hidden',
        }}
      >
        {/* Halo radial --accent-3 */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '50%',
            height: '150%',
            background: `radial-gradient(ellipse at center, var(--aurora-3)1A 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 3vw, 36px)',
              fontWeight: 700,
              color: 'var(--bg-surface)',
              marginBottom: 'var(--space-10)',
            }}
          >
            {t('sections.tools')}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
            {[
              {
                num: '01',
                href: `/${locale}/outils/quiz`,
                title: locale === 'fr' ? 'Quiz aspirateur' : 'Vacuum quiz',
                desc: locale === 'fr'
                  ? 'Répondez à 6 questions, obtenez une recommandation personnalisée.'
                  : 'Answer 6 questions, get a personalised recommendation.',
              },
              {
                num: '02',
                href: `/${locale}/outils/simulateur`,
                title: locale === 'fr' ? 'Simulateur superficie' : 'Area simulator',
                desc: locale === 'fr'
                  ? 'Calculez l\'autonomie et la capacité recommandées selon vos m².'
                  : 'Calculate the recommended autonomy and capacity for your area.',
              },
              {
                num: '03',
                href: `/${locale}/outils/comparateur`,
                title: locale === 'fr' ? 'Comparateur' : 'Comparator',
                desc: locale === 'fr'
                  ? 'Comparez deux modèles côte-à-côte sur tous les critères.'
                  : 'Compare two models side by side on all criteria.',
              },
            ].map(({ num, href, title, desc }) => (
              <Link
                key={href}
                href={href}
                style={{ textDecoration: 'none' }}
              >
                <article
                  style={{
                    padding: 'var(--space-8)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 'var(--radius-lg)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'background 0.2s var(--ease-out)',
                  }}
                >
                  {/* Numérotation oversize watermark */}
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      top: 'var(--space-4)',
                      right: 'var(--space-4)',
                      fontFamily: 'var(--font-display)',
                      fontSize: '72px',
                      fontWeight: 900,
                      color: 'rgba(255,255,255,0.05)',
                      lineHeight: 1,
                      userSelect: 'none',
                    }}
                  >
                    {num}
                  </span>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '20px',
                      fontWeight: 700,
                      color: 'var(--bg-surface)',
                      margin: '0 0 var(--space-3)',
                    }}
                  >
                    {title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', color: 'rgba(242,195,154,0.8)', lineHeight: 1.6 }}>
                    {desc}
                  </p>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider variant="diagonal" fill="var(--bg-surface-2)" />

      {/* ── COMPARATIFS — effect-comparateur ── */}
      <section
        style={{
          position: 'relative',
          background: 'var(--bg-surface-2)',
          padding: 'var(--space-16) var(--space-10)',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-8)' }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(24px, 3vw, 36px)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              {t('sections.comparatifs')}
            </h2>
            <Link href={`/${locale}/comparatifs`} style={{ fontSize: '14px', color: 'var(--accent-1)', textDecoration: 'none', fontWeight: 600 }}>
              {tCommon('readMore')} →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
            {comparatifs.slice(0, 2).map((comp) => (
              <article
                key={comp.slug}
                className="card-lift glass"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-6)',
                }}
              >
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                  <span style={{ padding: '4px 12px', background: 'var(--accent-1)', color: '#fff', borderRadius: 'var(--radius-full)', fontSize: '13px', fontWeight: 700 }}>
                    {comp.brandA}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>vs</span>
                  <span style={{ padding: '4px 12px', background: 'var(--bg-surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', fontSize: '13px', fontWeight: 700 }}>
                    {comp.brandB}
                  </span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 var(--space-3)', lineHeight: 1.3 }}>
                  <Link href={`/${locale}/comparatifs/${comp.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {comp.title}
                  </Link>
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {comp.verdict}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider variant="wave" fill="var(--bg-primary)" />

      {/* ── BLOG ── */}
      {articles.length > 0 && (
        <section style={{ background: 'var(--bg-primary)', padding: 'var(--space-16) var(--space-10)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-8)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {t('sections.blog')}
              </h2>
              <Link href={`/${locale}/blog`} style={{ fontSize: '14px', color: 'var(--accent-1)', textDecoration: 'none', fontWeight: 600 }}>
                {tCommon('readMore')} →
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
              {articles.slice(0, 3).map((article) => (
                <article
                  key={article.slug}
                  className="card-lift"
                  style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: 'var(--space-6)' }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--accent-1)' }}>
                    {article.category}
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: 'var(--space-2) 0 var(--space-3)', lineHeight: 1.35 }}>
                    <Link href={`/${locale}/blog/${article.categorySlug}/${article.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {article.title}
                    </Link>
                  </h3>
                  <p style={{ margin: '0 0 var(--space-4)', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {article.excerpt}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <time dateTime={article.publishedAt}>
                      {new Date(article.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-BE' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </time>
                    <span>{article.readingTimeMin} min</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
