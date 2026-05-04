// @cdc 5.0 — Hub blog · ISR 3600s
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { currentYear } from '@/lib/utils/year'
import { getArticlesMdx } from '@/lib/content/articles'
import NoiseOverlay from '@/components/effects/NoiseOverlay'
import BlogFilter from '@/components/blog/BlogFilter'

export const revalidate = 3600

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog.meta' })
  const year = currentYear()
  return {
    title: t('title', { year }),
    description: t('description', { year }),
    alternates: {
      canonical: `/${locale}/blog`,
      languages: { fr: '/fr/blog', en: '/en/blog' },
    },
  }
}

export default async function BlogHubPage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })
  const articles = getArticlesMdx(locale)

  return (
    <>
      {/* Hero */}
      <section
        style={{
          position: 'relative',
          background: 'var(--bg-surface)',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <NoiseOverlay />
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '3.5rem 1.5rem 3rem', position: 'relative', zIndex: 1 }}>
          <nav aria-label="Fil d'Ariane" style={{ marginBottom: '1.5rem' }}>
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: '.5rem', fontSize: '13px', color: 'var(--text-muted)' }}>
              <li>
                <Link href={`/${locale}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                  {locale === 'fr' ? 'Accueil' : 'Home'}
                </Link>
              </li>
              <li aria-hidden="true">›</li>
              <li style={{ color: 'var(--accent-1)' }}>Blog</li>
            </ol>
          </nav>

          <h1
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(2rem, 4vw, 3.25rem)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 .75rem',
              lineHeight: 1.1,
            }}
          >
            {t('hub.title')}
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', margin: 0, maxWidth: 560, lineHeight: 1.7 }}>
            {t('hub.subtitle')}
          </p>
        </div>
      </section>

      {/* Filtres + articles */}
      <BlogFilter articles={articles} locale={locale} />
    </>
  )
}
