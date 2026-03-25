// @cdc 5.3 — Article blog · ISR 1800s · JSON-LD Article + Person + FAQPage
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { currentYear } from '@/lib/utils/year'
import { getArticle, getArticles } from '@/lib/data/mock/articles'
import { getAuthor } from '@/lib/data/mock/authors'
import AuthorByline from '@/components/ui/AuthorByline'
import AuthorCard from '@/components/ui/AuthorCard'
import FaqAccordion from '@/components/ui/FaqAccordion'
import SectionDivider from '@/components/effects/SectionDivider'
import NoiseOverlay from '@/components/effects/NoiseOverlay'

export const revalidate = 1800

type PageProps = { params: Promise<{ locale: string; categorie: string; slug: string }> }

export async function generateStaticParams() {
  const fr = getArticles('fr').map((a) => ({ locale: 'fr', categorie: a.categorySlug, slug: a.slug }))
  const en = getArticles('en').map((a) => ({ locale: 'en', categorie: a.categorySlug, slug: a.slug }))
  return [...fr, ...en]
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const article = getArticle(slug, locale)
  if (!article) return {}
  const year = currentYear()
  return {
    title: `${article.title} ${year} | mon-aspirateur.be`,
    description: article.excerpt,
    alternates: { canonical: `/${locale}/blog/${article.categorySlug}/${slug}` },
  }
}

function renderBody(body: string) {
  const lines = body.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i] ?? ''
    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 'var(--space-8) 0 var(--space-3)' }}>{line.slice(4)}</h3>)
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, color: 'var(--text-primary)', margin: 'var(--space-10) 0 var(--space-4)' }}>{line.slice(3)}</h2>)
    } else if (line.startsWith('- ')) {
      const items: string[] = []
      while (i < lines.length && (lines[i] ?? '').startsWith('- ')) { items.push((lines[i] ?? '').slice(2)); i++ }
      elements.push(<ul key={`ul-${i}`} style={{ margin: 'var(--space-4) 0', paddingLeft: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>{items.map((item, ii) => <li key={ii} style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>') }} />)}</ul>)
      continue
    } else if (line.startsWith('### ') || line.startsWith('#### ')) {
      elements.push(<h3 key={i} style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 'var(--space-6) 0 var(--space-3)' }}>{line.replace(/^#{1,6} /, '')}</h3>)
    } else if (line.trim() !== '') {
      elements.push(<p key={i} style={{ margin: 'var(--space-4) 0', color: 'var(--text-secondary)', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>') }} />)
    }
    i++
  }
  return elements
}

export default async function ArticlePage({ params }: PageProps) {
  const { locale, slug } = await params
  const article = getArticle(slug, locale)
  if (!article) notFound()

  const author = getAuthor(article.authorSlug)
  const t = await getTranslations({ locale, namespace: 'blog' })

  // TL;DR — 3 bullets extraits de l'excerpt si > 600 mots
  const wordCount = article.body.split(/\s+/).length
  const showTldr = wordCount > 600

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: { '@type': 'Person', name: author?.name ?? 'Thomas V.', url: `https://mon-aspirateur.be/${locale}/auteurs/thomas-v` },
    publisher: { '@type': 'Organization', name: 'mon-aspirateur.be' },
    description: article.excerpt,
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: locale === 'fr' ? 'Accueil' : 'Home', item: `https://mon-aspirateur.be/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `https://mon-aspirateur.be/${locale}/blog` },
      { '@type': 'ListItem', position: 3, name: article.category, item: `https://mon-aspirateur.be/${locale}/blog/${article.categorySlug}` },
      { '@type': 'ListItem', position: 4, name: article.title, item: `https://mon-aspirateur.be/${locale}/blog/${article.categorySlug}/${slug}` },
    ],
  }

  const faqJsonLd = article.faq && article.faq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  } : null

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

      {/* Hero article */}
      <section style={{ position: 'relative', background: 'var(--bg-surface)', padding: 'var(--space-16) var(--space-10)', overflow: 'hidden' }}>
        <NoiseOverlay />
        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Breadcrumb */}
          <nav aria-label="Fil d'Ariane" style={{ marginBottom: 'var(--space-4)' }}>
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-muted)' }}>
              <li><Link href={`/${locale}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{locale === 'fr' ? 'Accueil' : 'Home'}</Link></li>
              <li aria-hidden="true">›</li>
              <li><Link href={`/${locale}/blog`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Blog</Link></li>
              <li aria-hidden="true">›</li>
              <li style={{ color: 'var(--accent-1)' }}>{article.category}</li>
            </ol>
          </nav>

          {/* Temps de lecture */}
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 var(--space-4)' }}>
            {article.readingTimeMin} min · {wordCount} {locale === 'fr' ? 'mots' : 'words'}
          </p>

          <h1 className="typo-h1-article" style={{ margin: '0 0 var(--space-6)' }}>
            {article.title}
          </h1>

          {author && (
            <AuthorByline
              authorSlug={author.slug}
              authorName={author.name}
              publishedAt={article.publishedAt}
              updatedAt={article.updatedAt}
              readingTimeMin={article.readingTimeMin}
              locale={locale}
            />
          )}
        </div>
      </section>

      <SectionDivider variant="diagonal" fill="var(--bg-primary)" flipY />

      <article style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--space-12) var(--space-10)' }}>
        {/* TL;DR */}
        {showTldr && (
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', borderLeft: '4px solid var(--accent-1)', padding: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
            <p style={{ margin: '0 0 var(--space-3)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent-1)' }}>
              {t('tldr')}
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <li style={{ display: 'flex', gap: 'var(--space-2)', color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6 }}>
                <span style={{ color: 'var(--accent-1)', flexShrink: 0 }}>→</span>
                {article.excerpt}
              </li>
            </ul>
          </div>
        )}

        {renderBody(article.body)}

        {/* FAQ */}
        {article.faq && article.faq.length > 0 && (
          <div style={{ marginTop: 'var(--space-12)' }}>
            <FaqAccordion items={article.faq} title={t('faq')} />
          </div>
        )}

        {/* AuthorCard */}
        {author && (
          <div style={{ marginTop: 'var(--space-12)' }}>
            <AuthorCard author={author} variant="inline" locale={locale} />
          </div>
        )}

        <div style={{ marginTop: 'var(--space-10)', paddingTop: 'var(--space-8)', borderTop: '1px solid var(--border)' }}>
          <Link href={`/${locale}/blog`} style={{ color: 'var(--accent-1)', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
            ← {locale === 'fr' ? 'Tous les articles' : 'All articles'}
          </Link>
        </div>
      </article>
    </>
  )
}
