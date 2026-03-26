// ISR 1800s — Article blog · MDX + JSON-LD Article + FAQPage
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { getArticleMdx, getAllArticleParams } from '@/lib/content/articles'
import { getAuthor } from '@/lib/data/mock/authors'
import AuthorByline from '@/components/ui/AuthorByline'
import AuthorCard from '@/components/ui/AuthorCard'
import FaqAccordion from '@/components/ui/FaqAccordion'
import NoiseOverlay from '@/components/effects/NoiseOverlay'
import Tip from '@/components/mdx/Tip'
import Warning from '@/components/mdx/Warning'
import Verdict from '@/components/mdx/Verdict'
import PullQuote from '@/components/mdx/PullQuote'
import StatCard from '@/components/mdx/StatCard'
import ProConTable from '@/components/mdx/ProConTable'
import AISummarize from '@/components/mdx/AISummarize'
import TLDRBox from '@/components/mdx/TLDRBox'
import type { FaqItem } from '@/lib/data/types'

export const revalidate = 1800

type PageProps = { params: Promise<{ locale: string; categorie: string; slug: string }> }

const MDX_COMPONENTS = { Tip, Warning, Verdict, PullQuote, StatCard, ProConTable, AISummarize, TLDRBox }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MDX_OPTIONS = { mdxOptions: { remarkPlugins: [remarkGfm] as any } }

export async function generateStaticParams() {
  return getAllArticleParams()
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, categorie, slug } = await params
  const article = getArticleMdx(locale, categorie, slug)
  if (!article) return {}
  return {
    title: article.metaTitle ? `${article.metaTitle} | mon-aspirateur.be` : `${article.title} | mon-aspirateur.be`,
    description: article.metaDescription ?? article.excerpt,
    alternates: { canonical: `/${locale}/blog/${article.categorySlug}/${slug}` },
  }
}

// Extract FAQ items from MDX frontmatter (optional field)
type ArticleFaq = { faq?: FaqItem[] }

export default async function ArticlePage({ params }: PageProps) {
  const { locale, categorie, slug } = await params
  const article = getArticleMdx(locale, categorie, slug)
  if (!article) notFound()

  const author = getAuthor(article.authorSlug)
  const faq = (article as ArticleFaq).faq ?? []
  const wordCount = article.content.split(/\s+/).length

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: {
      '@type': 'Person',
      name: author?.name ?? 'Thomas V.',
      url: `https://www.mon-aspirateur.be/${locale}/auteurs/thomas-v`,
    },
    publisher: { '@type': 'Organization', name: 'mon-aspirateur.be' },
    description: article.excerpt,
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: locale === 'fr' ? 'Accueil' : 'Home', item: `https://www.mon-aspirateur.be/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `https://www.mon-aspirateur.be/${locale}/blog` },
      { '@type': 'ListItem', position: 3, name: article.category, item: `https://www.mon-aspirateur.be/${locale}/blog/${article.categorySlug}` },
      { '@type': 'ListItem', position: 4, name: article.title, item: `https://www.mon-aspirateur.be/${locale}/blog/${article.categorySlug}/${slug}` },
    ],
  }

  const faqJsonLd = faq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
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

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        background: 'var(--bg-surface)',
        padding: '3rem 1.5rem',
        borderBottom: '1px solid var(--border-light)',
        overflow: 'hidden',
      }}>
        <NoiseOverlay />
        <div style={{ maxWidth: 740, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Breadcrumb */}
          <nav aria-label="Fil d'Ariane" style={{ marginBottom: '1rem' }}>
            <ol style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              gap: '.4rem',
              flexWrap: 'wrap',
              fontSize: '.8rem',
              color: 'var(--text-muted)',
            }}>
              <li>
                <Link href={`/${locale}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                  {locale === 'fr' ? 'Accueil' : 'Home'}
                </Link>
              </li>
              <li aria-hidden="true">›</li>
              <li>
                <Link href={`/${locale}/blog`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Blog</Link>
              </li>
              <li aria-hidden="true">›</li>
              <li style={{ color: 'var(--accent-1)' }}>{article.category}</li>
            </ol>
          </nav>

          {/* Category + reading time */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{
              fontSize: '.72rem',
              fontWeight: 700,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: 'var(--accent-1)',
            }}>
              {article.category}
            </span>
            <span style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>
              {article.readingTimeMin} min · {wordCount} {locale === 'fr' ? 'mots' : 'words'}
            </span>
          </div>

          <h1 className="typo-h1-article" style={{ margin: '0 0 1.25rem' }}>
            {article.title}
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: '0 0 1.5rem' }}>
            {article.excerpt}
          </p>

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

      {/* ── ARTICLE BODY ─────────────────────────────────────────── */}
      <div style={{ maxWidth: 740, margin: '0 auto', padding: '3rem 1.5rem' }}>
        <article className="prose-article">
          <MDXRemote source={article.content} components={MDX_COMPONENTS} options={MDX_OPTIONS} />
        </article>

        {/* FAQ */}
        {faq.length > 0 && (
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-light)' }}>
            <FaqAccordion items={faq} title={locale === 'fr' ? 'Questions fréquentes' : 'FAQ'} />
          </div>
        )}

        {/* Author card */}
        {author && (
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-light)' }}>
            <AuthorCard author={author} variant="inline" locale={locale} />
          </div>
        )}

        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
          <Link
            href={`/${locale}/blog`}
            style={{
              color: 'var(--accent-1)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '.875rem',
            }}
          >
            ← {locale === 'fr' ? 'Tous les articles' : 'All articles'}
          </Link>
        </div>
      </div>
    </>
  )
}
