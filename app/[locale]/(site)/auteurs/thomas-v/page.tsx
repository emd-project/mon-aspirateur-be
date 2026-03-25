// @cdc 5.4 — Page auteur · SSR · JSON-LD Person + ItemList
// effect-page-auteur → monogramme CSS 'TV' Playfair 900 120px --accent-1

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { getAuthor } from '@/lib/data/mock/authors'
import { getArticles } from '@/lib/data/mock/articles'
import { getGuides } from '@/lib/data/mock/guides'
import { currentYear } from '@/lib/utils/year'
import AuthorCard from '@/components/ui/AuthorCard'
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

  // JSON-LD Person
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    jobTitle: author.title,
    url: `https://mon-aspirateur.be/auteurs/${author.slug}`,
    description: author.bioShort,
    sameAs: [],
    knowsAbout: author.knowsAbout,
  }

  // JSON-LD ItemList — articles publiés
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
      url: `https://mon-aspirateur.be${item.url}`,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      {/* Hero — effect-page-auteur */}
      <section
        style={{
          position: 'relative',
          background: 'var(--bg-surface)',
          overflow: 'hidden',
          padding: 'var(--space-16) var(--space-10)',
        }}
      >
        <NoiseOverlay />

        <div
          style={{
            maxWidth: 900,
            margin: '0 auto',
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 'var(--space-10)',
            alignItems: 'center',
          }}
        >
          {/* Content */}
          <div>
            {/* Breadcrumb */}
            <nav aria-label="Fil d'Ariane" style={{ marginBottom: 'var(--space-6)' }}>
              <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: 'var(--space-2)', fontSize: '13px', color: 'var(--text-muted)' }}>
                <li><Link href={`/${locale}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{locale === 'fr' ? 'Accueil' : 'Home'}</Link></li>
                <li aria-hidden="true">›</li>
                <li style={{ color: 'var(--accent-1)' }}>{locale === 'fr' ? 'Auteur' : 'Author'}</li>
              </ol>
            </nav>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(32px, 4vw, 52px)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: '0 0 var(--space-3)',
                lineHeight: 1.1,
              }}
            >
              {author.name}
            </h1>

            <p
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--accent-1)',
                margin: '0 0 var(--space-6)',
              }}
            >
              {author.title}
            </p>

            <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                {tAuthor('testedSince')}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                {tAuthor('publishedArticles', { count: allContent.length })}
              </span>
            </div>
          </div>

          {/* Monogramme CSS oversize — DA effect-page-auteur */}
          <div
            aria-hidden="true"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(80px, 10vw, 120px)',
              fontWeight: 900,
              color: 'var(--accent-1)',
              lineHeight: 1,
              letterSpacing: '-0.04em',
              opacity: 0.15,
              userSelect: 'none',
            }}
          >
            TV
          </div>
        </div>
      </section>

      {/* Bio complète */}
      <section
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: 'var(--space-12) var(--space-10)',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(20px, 2.5vw, 28px)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-6)',
          }}
        >
          {locale === 'fr' ? `À propos de ${author.name}` : `About ${author.name}`}
        </h2>

        <div
          style={{
            lineHeight: 1.85,
            color: 'var(--text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          {author.bioLong.split('\n\n').map((para, i) => (
            <p key={i} style={{ margin: 0 }}>
              {para}
            </p>
          ))}
        </div>

        {/* Crédibilité / signaux EEAT */}
        <div
          style={{
            marginTop: 'var(--space-10)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          {[
            { value: '60+', label: locale === 'fr' ? 'modèles testés' : 'models tested' },
            { value: year - 2019 + ' ans', label: locale === 'fr' ? `d'expérience (depuis 2019)` : 'of experience (since 2019)' },
            { value: String(allContent.length), label: locale === 'fr' ? 'articles publiés' : 'published articles' },
          ].map(({ value, label }) => (
            <div
              key={label}
              style={{
                padding: 'var(--space-6)',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '32px',
                  fontWeight: 900,
                  color: 'var(--accent-1)',
                  lineHeight: 1,
                  marginBottom: 'var(--space-2)',
                }}
              >
                {value}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Articles publiés */}
      {allContent.length > 0 && (
        <section
          style={{
            background: 'var(--bg-surface)',
            padding: 'var(--space-12) var(--space-10)',
          }}
        >
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(20px, 2.5vw, 28px)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-8)',
              }}
            >
              {locale === 'fr' ? 'Articles & guides publiés' : 'Published articles & guides'}
            </h2>

            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {allContent.map((item) => (
                <li key={item.url}>
                  <Link
                    href={`/${locale}${item.url.replace(`/${locale}`, '')}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontWeight: 500,
                      padding: 'var(--space-3) 0',
                      borderBottom: '1px solid var(--border)',
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

      {/* AuthorCard full */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--space-12) var(--space-10)' }}>
        <AuthorCard author={author} variant="full" locale={locale} />
      </section>
    </>
  )
}
