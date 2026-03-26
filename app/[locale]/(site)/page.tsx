import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { getTopPicksByCategory } from '@/lib/data/brands'
import { categoryOrder, categoryMeta } from '@/lib/data/comparateur'
import { brands } from '@/lib/data/brands'
import { getArticlesMdx } from '@/lib/content/articles'
import ProductCTA from '@/components/ui/ProductCTA'
import NoiseOverlay from '@/components/effects/NoiseOverlay'

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
  url: 'https://mon-aspirateur.be',
  publisher: { '@type': 'Organization', name: 'Mon Aspirateur' },
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home' })
  const base = `/${locale}`

  const topBalai = getTopPicksByCategory('balai').slice(0, 2)
  const topRobot = getTopPicksByCategory('robot').slice(0, 2)
  const topPicks = [...topBalai, ...topRobot]
  const topBrands = brands.slice(0, 6)
  const articles = getArticlesMdx(locale).slice(0, 5)
  const featuredArticle = articles[0] ?? null
  const otherArticles = articles.slice(1, 4)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── HERO SPLIT ──────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-light)',
        overflow: 'hidden',
      }}>
        <NoiseOverlay opacity={0.03} />

        {/* Watermark décoratif */}
        <span aria-hidden="true" style={{
          position: 'absolute',
          right: '-1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          fontFamily: 'var(--font-playfair), Georgia, serif',
          fontSize: 'clamp(8rem, 20vw, 18rem)',
          fontWeight: 900,
          lineHeight: 1,
          color: 'var(--border-light)',
          userSelect: 'none',
          pointerEvents: 'none',
          letterSpacing: '-.04em',
          whiteSpace: 'nowrap',
          opacity: .7,
        }}>
          MA
        </span>

        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: 'clamp(4rem, 8vw, 7rem) 1.5rem clamp(3.5rem, 6vw, 5rem)',
          position: 'relative',
          zIndex: 1,
        }}>
          <div className="grid-hero">

            {/* ── Gauche : texte ─────────────────── */}
            <div className="animate-fade-up">
              <p style={{
                fontSize: '.72rem',
                fontWeight: 700,
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                color: 'var(--accent-1)',
                marginBottom: '1.5rem',
              }}>
                {locale === 'fr' ? 'Aspirateurs — Tests terrain · Belgique' : 'Vacuum cleaners — Field tests · Belgium'}
              </p>

              <h1 style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontSize: 'clamp(3rem, 6.5vw, 5.5rem)',
                fontWeight: 900,
                lineHeight: 1.06,
                letterSpacing: '-.025em',
                color: 'var(--text-primary)',
                margin: '0 0 1.75rem',
              }}>
                {locale === 'fr' ? (
                  <>
                    Choisissez<br />
                    votre<br />
                    <span style={{ color: 'var(--accent-1)' }}>aspirateur.</span>
                  </>
                ) : (
                  <>
                    Choose<br />
                    your<br />
                    <span style={{ color: 'var(--accent-1)' }}>vacuum.</span>
                  </>
                )}
              </h1>

              <p style={{
                fontSize: 'clamp(.95rem, 1.8vw, 1.1rem)',
                lineHeight: 1.75,
                color: 'var(--text-secondary)',
                marginBottom: '2.5rem',
                maxWidth: '38ch',
              }}>
                {t('hero.subheadline')}
              </p>

              <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                <Link href={`${base}/comparer/balai`} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '.4rem',
                  padding: '.75rem 1.5rem',
                  background: 'var(--accent-1)',
                  color: '#fff',
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '.9rem',
                  textDecoration: 'none',
                }}>
                  {t('hero.cta')} →
                </Link>
                <Link href={`${base}/quiz`} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '.4rem',
                  padding: '.75rem 1.5rem',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '4px',
                  fontWeight: 500,
                  fontSize: '.9rem',
                  textDecoration: 'none',
                }}>
                  {locale === 'fr' ? 'Quiz (2 min)' : 'Quick quiz'}
                </Link>
              </div>
            </div>

            {/* ── Droite : catégories numérotées ─── */}
            <nav aria-label={locale === 'fr' ? 'Catégories principales' : 'Main categories'}>
              {categoryOrder.map((cat, i) => {
                const meta = categoryMeta[cat]
                return (
                  <Link key={cat} href={`${base}/comparer/${cat}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '2.5rem 1fr auto',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem 0',
                      borderBottom: '1px solid var(--border-light)',
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-playfair), Georgia, serif',
                        fontSize: '.85rem',
                        fontWeight: 900,
                        color: 'var(--border-medium)',
                        lineHeight: 1,
                      }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <div style={{
                          fontFamily: 'var(--font-playfair), Georgia, serif',
                          fontWeight: 700,
                          fontSize: '1.05rem',
                          color: 'var(--text-primary)',
                          marginBottom: '.1rem',
                        }}>
                          {meta.label}
                        </div>
                        <div style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                          {meta.description}
                        </div>
                      </div>
                      <span style={{ fontSize: '.85rem', color: 'var(--accent-1)', fontWeight: 600 }}>→</span>
                    </div>
                  </Link>
                )
              })}
            </nav>

          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>

        {/* ── ARTICLES RÉCENTS ──────────────────────────────────── */}
        {(featuredArticle || otherArticles.length > 0) && (
          <section style={{ padding: '4rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem' }}>
              <div>
                <p style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--accent-1)', marginBottom: '.35rem' }}>
                  {locale === 'fr' ? 'Éditorial' : 'Editorial'}
                </p>
                <h2 className="typo-h2" style={{ margin: 0 }}>
                  {locale === 'fr' ? 'Derniers articles' : 'Latest articles'}
                </h2>
              </div>
              <Link href={`${base}/blog`} style={{ fontSize: '.875rem', color: 'var(--accent-1)', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {locale === 'fr' ? 'Tout le blog →' : 'All articles →'}
              </Link>
            </div>

            {/* Article en vedette */}
            {featuredArticle && (
              <Link
                href={`${base}/blog/${featuredArticle.categorySlug}/${featuredArticle.slug}`}
                style={{ textDecoration: 'none', display: 'block', marginBottom: '1.5rem' }}
              >
                <article style={{
                  padding: '1.75rem 2rem',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-light)',
                  borderLeft: '4px solid var(--accent-1)',
                  borderRadius: '0 6px 6px 0',
                }}>
                  <p style={{
                    fontSize: '.7rem',
                    fontWeight: 700,
                    letterSpacing: '.14em',
                    textTransform: 'uppercase',
                    color: 'var(--accent-1)',
                    marginBottom: '.75rem',
                  }}>
                    {featuredArticle.category}
                  </p>
                  <h3 style={{
                    fontFamily: 'var(--font-playfair), Georgia, serif',
                    fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    margin: '0 0 .75rem',
                    lineHeight: 1.22,
                  }}>
                    {featuredArticle.title}
                  </h3>
                  <p style={{ fontSize: '.9rem', color: 'var(--text-secondary)', margin: '0 0 1rem', lineHeight: 1.6, maxWidth: '64ch' }}>
                    {featuredArticle.excerpt}
                  </p>
                  <div style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                    <time dateTime={featuredArticle.publishedAt}>
                      {new Date(featuredArticle.publishedAt).toLocaleDateString(
                        locale === 'fr' ? 'fr-BE' : 'en-GB',
                        { year: 'numeric', month: 'long', day: 'numeric' }
                      )}
                    </time>
                    <span style={{ margin: '0 .5rem' }}>·</span>
                    <span>{featuredArticle.readingTimeMin} min</span>
                  </div>
                </article>
              </Link>
            )}

            {/* Grille articles secondaires */}
            {otherArticles.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1px',
                background: 'var(--border-light)',
                border: '1px solid var(--border-light)',
                borderRadius: '6px',
                overflow: 'hidden',
              }}>
                {otherArticles.map(article => (
                  <Link
                    key={article.slug}
                    href={`${base}/blog/${article.categorySlug}/${article.slug}`}
                    style={{ textDecoration: 'none', display: 'block' }}
                  >
                    <article style={{
                      background: 'var(--bg-surface)',
                      padding: '1.25rem',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '.5rem',
                    }}>
                      <p style={{
                        fontSize: '.68rem',
                        fontWeight: 700,
                        letterSpacing: '.12em',
                        textTransform: 'uppercase',
                        color: 'var(--accent-1)',
                        margin: 0,
                      }}>
                        {article.category}
                      </p>
                      <h3 style={{
                        fontFamily: 'var(--font-playfair), Georgia, serif',
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        margin: 0,
                        lineHeight: 1.35,
                        flex: 1,
                      }}>
                        {article.title}
                      </h3>
                      <p style={{ fontSize: '.78rem', color: 'var(--text-muted)', margin: 0 }}>
                        {article.readingTimeMin} min
                      </p>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── TOP PICKS ───────────────────────────────────────────── */}
        <section style={{ padding: '4rem 0', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem' }}>
            <div>
              <p style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '.35rem' }}>
                {locale === 'fr' ? 'Sélection' : 'Top picks'}
              </p>
              <h2 className="typo-h2" style={{ margin: 0 }}>{t('sections.topPicks')}</h2>
            </div>
            <Link href={`${base}/comparer/balai`} style={{ fontSize: '.875rem', color: 'var(--accent-1)', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {locale === 'fr' ? 'Voir tous →' : 'See all →'}
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
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
        <section style={{ padding: '4rem 0', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem' }}>
            <div>
              <p style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '.35rem' }}>
                {locale === 'fr' ? 'Marques' : 'Brands'}
              </p>
              <h2 className="typo-h2" style={{ margin: 0 }}>{t('sections.marques')}</h2>
            </div>
            <Link href={`${base}/marques`} style={{ fontSize: '.875rem', color: 'var(--accent-1)', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {locale === 'fr' ? 'Toutes les marques →' : 'All brands →'}
            </Link>
          </div>
          <div className="grid-brands">
            {topBrands.map(brand => {
              const top = brand.topProducts?.[0]
              return (
                <Link key={brand.slug} href={`${base}/marques/${brand.slug}`} style={{ textDecoration: 'none', display: 'flex' }}>
                  <div style={{
                    width: '100%',
                    padding: '1.25rem 1.5rem',
                    border: '1px solid var(--border-light)',
                    borderRadius: '6px',
                    background: 'var(--bg-surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '.75rem',
                  }}>
                    {/* En-tête : nom + pays */}
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '.5rem' }}>
                      <span style={{
                        fontFamily: 'var(--font-playfair), Georgia, serif',
                        fontWeight: 900,
                        fontSize: '1.15rem',
                        color: 'var(--text-primary)',
                        letterSpacing: '-.01em',
                      }}>
                        {brand.name}
                      </span>
                      <span style={{
                        fontSize: '.65rem',
                        fontWeight: 700,
                        letterSpacing: '.1em',
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '3px',
                        padding: '.1rem .35rem',
                        flexShrink: 0,
                      }}>
                        {brand.country}
                      </span>
                    </div>

                    {/* Positionnement */}
                    <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.55, flex: 1 }}>
                      {brand.positioning}
                    </p>

                    {/* Catégories */}
                    <div style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap' }}>
                      {brand.categories.map(cat => (
                        <span key={cat} style={{
                          fontSize: '.65rem',
                          fontWeight: 600,
                          letterSpacing: '.06em',
                          textTransform: 'uppercase',
                          color: 'var(--text-muted)',
                          background: 'var(--bg-subtle)',
                          borderRadius: '3px',
                          padding: '.15rem .45rem',
                        }}>
                          {cat}
                        </span>
                      ))}
                    </div>

                    {/* Produit phare */}
                    {top && (
                      <div style={{
                        paddingTop: '.75rem',
                        borderTop: '1px solid var(--border-light)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        gap: '.5rem',
                      }}>
                        <span style={{ fontSize: '.78rem', color: 'var(--text-muted)', lineHeight: 1.4, flex: 1 }}>
                          {top.name}
                        </span>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '.85rem',
                          color: 'var(--accent-1)',
                          flexShrink: 0,
                        }}>
                          {top.priceEur} €
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── OUTILS ──────────────────────────────────────────────── */}
        <section style={{ padding: '4rem 0 5rem', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '.35rem' }}>
              Outils
            </p>
            <h2 className="typo-h2" style={{ margin: 0 }}>{t('sections.comparer')}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '.75rem' }}>
            {([
              { href: `${base}/quiz`,       title: 'Quiz aspirateur',   desc: '4 questions → recommandation', cta: 'Faire le quiz' },
              { href: `${base}/deals`,      title: 'Deals & Promos',    desc: 'Sélection promos du moment',   cta: 'Voir les deals' },
              { href: `${base}/simulateur`, title: 'Quand acheter ?',   desc: 'Calendrier prix Amazon',       cta: 'Voir le calendrier' },
            ] as const).map(tool => (
              <Link key={tool.href} href={tool.href} style={{ display: 'block', padding: '1.25rem', border: '1px solid var(--border-light)', borderRadius: '6px', background: 'var(--bg-surface)', textDecoration: 'none' }}>
                <div style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700, fontSize: '.95rem', color: 'var(--text-primary)', marginBottom: '.3rem' }}>{tool.title}</div>
                <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', margin: '0 0 .75rem', lineHeight: 1.5 }}>{tool.desc}</p>
                <span style={{ fontSize: '.82rem', color: 'var(--accent-1)', fontWeight: 600 }}>{tool.cta} →</span>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </>
  )
}
