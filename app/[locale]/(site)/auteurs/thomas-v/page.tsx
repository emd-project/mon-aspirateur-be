// @cdc 5.4 — Page auteur · SSR · JSON-LD Person + ItemList

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { getAuthor } from '@/lib/data/mock/authors'
import { getArticles } from '@/lib/data/mock/articles'
import { getGuides } from '@/lib/data/mock/guides'
import { currentYear } from '@/lib/utils/year'
import NoiseOverlay from '@/components/effects/NoiseOverlay'

export const revalidate = 86400

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'author.meta' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/auteurs/thomas-v`,
      languages: { fr: '/fr/auteurs/thomas-v', en: '/en/auteurs/thomas-v' },
    },
  }
}

export default async function AuthorPage({ params }: PageProps) {
  const { locale } = await params
  const author = getAuthor('thomas-v')
  const articles = getArticles(locale)
  const guides = getGuides(locale)
  const tAuthor = await getTranslations({ locale, namespace: 'author' })
  const year = currentYear()

  if (!author) return null

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    jobTitle: author.title,
    url: `https://www.mon-aspirateur.be/auteurs/${author.slug}`,
    description: author.bioShort,
    sameAs: [],
    knowsAbout: author.knowsAbout,
  }

  const allContent = [
    ...articles.map((a) => ({ url: `/${locale}/blog/${a.categorySlug}/${a.slug}`, name: a.title })),
    ...guides.map((g) => ({ url: `/${locale}/guides/${g.slug}`, name: g.title })),
  ]
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: allContent.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: `https://www.mon-aspirateur.be${item.url}`,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

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

        <div
          style={{
            maxWidth: 900,
            margin: '0 auto',
            padding: '3.5rem 1.5rem 3rem',
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '2rem',
            alignItems: 'center',
          }}
        >
          <div>
            <nav aria-label="Fil d'Ariane" style={{ marginBottom: '1.5rem' }}>
              <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: '.5rem', fontSize: '13px', color: 'var(--text-muted)' }}>
                <li><Link href={`/${locale}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{locale === 'fr' ? 'Accueil' : 'Home'}</Link></li>
                <li aria-hidden="true">›</li>
                <li style={{ color: 'var(--accent-1)' }}>{locale === 'fr' ? 'Auteur' : 'Author'}</li>
              </ol>
            </nav>

            <h1
              style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                fontSize: 'clamp(2rem, 4vw, 3.25rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: '0 0 .5rem',
                lineHeight: 1.1,
              }}
            >
              {author.name}
            </h1>

            <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--accent-1)', margin: '0 0 1rem' }}>
              {author.title}
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {tAuthor('testedSince')}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {tAuthor('publishedArticles', { count: allContent.length })}
              </span>
            </div>
          </div>

          <div
            aria-hidden="true"
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: 'clamp(5rem, 10vw, 7.5rem)',
              fontWeight: 900,
              color: 'var(--accent-1)',
              lineHeight: 1,
              letterSpacing: '-0.04em',
              opacity: 0.12,
              userSelect: 'none',
            }}
          >
            TV
          </div>
        </div>
      </section>

      {/* Bio complète */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h2
          style={{
            fontFamily: 'var(--font-display), Georgia, serif',
            fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '1.5rem',
            marginTop: 0,
          }}
        >
          {locale === 'fr' ? `À propos de ${author.name}` : `About ${author.name}`}
        </h2>

        <div style={{ lineHeight: 1.85, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {author.bioLong.split('\n\n').map((para, i) => (
            <p key={i} style={{ margin: 0 }}>{para}</p>
          ))}
        </div>

        {/* Signaux E-E-A-T */}
        <div
          style={{
            marginTop: '2.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
          }}
        >
          {[
            { value: '60+', label: locale === 'fr' ? 'modèles testés' : 'models tested' },
            { value: `${year - 2019} ans`, label: locale === 'fr' ? "d'expérience (depuis 2019)" : 'of experience (since 2019)' },
            { value: String(allContent.length), label: locale === 'fr' ? 'articles publiés' : 'published articles' },
          ].map(({ value, label }) => (
            <div
              key={label}
              style={{
                padding: '1.25rem',
                background: 'var(--bg-surface)',
                borderRadius: '6px',
                border: '1px solid var(--border-light)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: '2rem',
                  fontWeight: 900,
                  color: 'var(--accent-1)',
                  lineHeight: 1,
                  marginBottom: '.4rem',
                }}
              >
                {value}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Articles publiés */}
      {allContent.length > 0 && (
        <section
          style={{
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-light)',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem' }}>
            <h2
              style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '1.5rem',
                marginTop: 0,
              }}
            >
              {locale === 'fr' ? 'Articles & guides publiés' : 'Published articles & guides'}
            </h2>

            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
              {allContent.map((item) => (
                <li key={item.url}>
                  <Link
                    href={`/${locale}${item.url.replace(`/${locale}`, '')}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '.75rem',
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      fontSize: '.925rem',
                      fontWeight: 500,
                      padding: '.75rem 0',
                      borderBottom: '1px solid var(--border-light)',
                    }}
                  >
                    <span style={{ color: 'var(--accent-1)', flexShrink: 0 }} aria-hidden="true">→</span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
