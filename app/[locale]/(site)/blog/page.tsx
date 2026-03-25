// @cdc 5.0 — Hub blog · ISR 3600s
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { currentYear } from '@/lib/utils/year'
import { getArticlesMdx } from '@/lib/content/articles'
import NoiseOverlay from '@/components/effects/NoiseOverlay'

export const revalidate = 3600

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog.meta' })
  const year = currentYear()
  return {
    title: t('title', { year }),
    description: t('description', { year }),
    alternates: { canonical: `/${locale}/blog` },
  }
}

export default async function BlogHubPage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })
  const articles = getArticlesMdx(locale)

  return (
    <>
      {/* Hero */}
      <section style={{ position: 'relative', background: 'var(--bg-surface)', padding: '3rem 1.5rem', borderBottom: '1px solid var(--border-light)', overflow: 'hidden' }}>
        <NoiseOverlay />
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <nav aria-label="Fil d'Ariane" style={{ marginBottom: 'var(--space-6)' }}>
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: 'var(--space-2)', fontSize: '13px', color: 'var(--text-muted)' }}>
              <li><Link href={`/${locale}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{locale === 'fr' ? 'Accueil' : 'Home'}</Link></li>
              <li aria-hidden="true">›</li>
              <li style={{ color: 'var(--accent-1)' }}>Blog</li>
            </ol>
          </nav>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 var(--space-4)', lineHeight: 1.1 }}>
            {t('hub.title')}
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', margin: 0, maxWidth: 600, lineHeight: 1.7 }}>
            {t('hub.subtitle')}
          </p>
        </div>
      </section>

      {/* Articles grid */}
      <section style={{ background: 'var(--bg-primary)', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {articles.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-16) 0' }}>
              {locale === 'fr' ? 'Aucun article disponible.' : 'No articles available.'}
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {articles.map((article) => (
                <article key={article.slug} className="card-lift" style={{ background: 'var(--bg-surface)', borderRadius: '6px', border: '1px solid var(--border-light)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--accent-1)' }}>
                    {article.category}
                  </span>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
                    <Link href={`/${locale}/blog/${article.categorySlug}/${article.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {article.title}
                    </Link>
                  </h2>
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.65, flex: 1 }}>
                    {article.excerpt}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', marginTop: 'auto' }}>
                    <time dateTime={article.publishedAt}>
                      {new Date(article.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-BE' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </time>
                    <span>{article.readingTimeMin} min</span>
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
