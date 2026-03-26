'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ArticleMeta } from '@/lib/content/articles'

type Props = {
  articles: ArticleMeta[]
  locale: string
}

export default function BlogFilter({ articles, locale }: Props) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null)

  // Build unique categories
  const categories = Array.from(
    new Map(articles.map((a) => [a.categorySlug, a.category])).entries(),
  ).map(([slug, label]) => ({ slug, label }))

  const filtered = activeSlug ? articles.filter((a) => a.categorySlug === activeSlug) : articles

  const featured = filtered[0] ?? null
  const rest = filtered.slice(1)

  const tabBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.45rem',
    padding: '.5rem 0',
    marginRight: '1.75rem',
    fontSize: '.875rem',
    fontWeight: 600,
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    transition: 'color .15s, border-color .15s',
    whiteSpace: 'nowrap',
  }

  const tabActive: React.CSSProperties = {
    ...tabBase,
    color: 'var(--accent-1)',
    borderBottom: '2px solid var(--accent-1)',
  }

  return (
    <>
      {/* Onglets catégories */}
      <div
        style={{
          borderBottom: '1px solid var(--border-light)',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
          scrollbarWidth: 'none',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem', display: 'flex', minWidth: 'max-content' }}>
          <button
            onClick={() => setActiveSlug(null)}
            style={activeSlug === null ? tabActive : tabBase}
          >
            {locale === 'fr' ? 'Tous' : 'All'}
            <span style={{ fontSize: '.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
              {articles.length}
            </span>
          </button>
          {categories.map(({ slug, label }) => (
            <button
              key={slug}
              onClick={() => setActiveSlug(activeSlug === slug ? null : slug)}
              style={activeSlug === slug ? tabActive : tabBase}
            >
              {label}
              <span style={{ fontSize: '.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                {articles.filter((a) => a.categorySlug === slug).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenu filtré */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
        {filtered.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 0' }}>
            {locale === 'fr' ? 'Aucun article dans cette catégorie.' : 'No articles in this category.'}
          </p>
        )}

        {/* Article en vedette */}
        {featured && (
          <Link
            href={`/${locale}/blog/${featured.categorySlug}/${featured.slug}`}
            style={{ textDecoration: 'none', display: 'block', marginBottom: '2rem' }}
          >
            <article
              style={{
                padding: '1.75rem 2rem',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                borderLeft: '4px solid var(--accent-1)',
                borderRadius: '0 6px 6px 0',
              }}
            >
              <p style={{
                fontSize: '.7rem',
                fontWeight: 700,
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: 'var(--accent-1)',
                marginBottom: '.6rem',
              }}>
                {featured.category}
              </p>
              <h2 style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                fontSize: 'clamp(1.35rem, 3vw, 1.9rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: '0 0 .75rem',
                lineHeight: 1.22,
              }}>
                {featured.title}
              </h2>
              <p style={{ fontSize: '.9rem', color: 'var(--text-secondary)', margin: '0 0 1rem', lineHeight: 1.65, maxWidth: '62ch' }}>
                {featured.excerpt}
              </p>
              <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                <time dateTime={featured.publishedAt}>
                  {new Date(featured.publishedAt).toLocaleDateString(
                    locale === 'fr' ? 'fr-BE' : 'en-GB',
                    { year: 'numeric', month: 'long', day: 'numeric' },
                  )}
                </time>
                <span aria-hidden="true">·</span>
                <span>{featured.readingTimeMin} min</span>
              </div>
            </article>
          </Link>
        )}

        {/* Grille articles secondaires */}
        {rest.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
            gap: '1px',
            background: 'var(--border-light)',
            border: '1px solid var(--border-light)',
            borderRadius: '6px',
            overflow: 'hidden',
          }}>
            {rest.map((article) => (
              <Link
                key={article.slug}
                href={`/${locale}/blog/${article.categorySlug}/${article.slug}`}
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
                    fontFamily: 'var(--font-display), Georgia, serif',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    margin: 0,
                    lineHeight: 1.35,
                    flex: 1,
                  }}>
                    {article.title}
                  </h3>
                  <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', display: 'flex', gap: '.4rem' }}>
                    <time dateTime={article.publishedAt}>
                      {new Date(article.publishedAt).toLocaleDateString(
                        locale === 'fr' ? 'fr-BE' : 'en-GB',
                        { day: 'numeric', month: 'short', year: 'numeric' },
                      )}
                    </time>
                    <span aria-hidden="true">·</span>
                    <span>{article.readingTimeMin} min</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
