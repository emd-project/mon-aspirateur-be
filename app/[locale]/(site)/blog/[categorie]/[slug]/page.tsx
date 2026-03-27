// ISR 1800s — Article blog · MDX + JSON-LD Article + FAQPage
import React from 'react'
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
import ReadingProgress from '@/components/ui/ReadingProgress'
import TableOfContents from '@/components/ui/TableOfContents'
import NoiseOverlay from '@/components/effects/NoiseOverlay'
import Tip from '@/components/mdx/Tip'
import Warning from '@/components/mdx/Warning'
import Verdict from '@/components/mdx/Verdict'
import PullQuote from '@/components/mdx/PullQuote'
import StatCard from '@/components/mdx/StatCard'
import ProConTable from '@/components/mdx/ProConTable'
import ProductCTA from '@/components/mdx/ProductCTA'
import AISummarize from '@/components/mdx/AISummarize'
import TLDRBox from '@/components/mdx/TLDRBox'
import ArticleImage from '@/components/mdx/ArticleImage'
import type { FaqItem } from '@/lib/data/types'

export const revalidate = 1800

type PageProps = { params: Promise<{ locale: string; categorie: string; slug: string }> }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MDX_OPTIONS = { mdxOptions: { remarkPlugins: [remarkGfm] as any } }

function makeMdxComponents(title: string, articleUrl: string) {
  const AISummarizeWithMeta = (props: React.ComponentProps<typeof AISummarize>) => (
    <AISummarize {...props} title={title} articleUrl={articleUrl} />
  )
  return { Tip, Warning, Verdict, PullQuote, StatCard, ProConTable, AISummarize: AISummarizeWithMeta, TLDRBox, ProductCTA, ArticleImage }
}

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

/**
 * Split MDX content into up to 3 chunks at paragraph boundaries,
 * targeting the 1/3 and 2/3 word-count marks.
 * Returns [chunk1, chunk2, chunk3] — chunk2 and chunk3 may be empty strings.
 */
function splitContentIntoChunks(content: string): [string, string, string] {
  const blocks = content.split(/\n{2,}/)
  if (blocks.length < 3) return [content, '', '']

  const totalWords = content.split(/\s+/).length
  const target1 = Math.floor(totalWords / 3)
  const target2 = Math.floor((totalWords * 2) / 3)

  let wordsSoFar = 0
  let split1 = -1
  let split2 = -1

  for (let i = 0; i < blocks.length; i++) {
    wordsSoFar += (blocks[i] ?? '').split(/\s+/).length
    if (split1 === -1 && wordsSoFar >= target1) split1 = i
    if (split2 === -1 && wordsSoFar >= target2) { split2 = i; break }
  }

  if (split1 === -1 || split2 === -1 || split1 >= split2) return [content, '', '']

  const chunk1 = blocks.slice(0, split1 + 1).join('\n\n')
  const chunk2 = blocks.slice(split1 + 1, split2 + 1).join('\n\n')
  const chunk3 = blocks.slice(split2 + 1).join('\n\n')
  return [chunk1, chunk2, chunk3]
}

/**
 * Replace standalone affiliate link lines with <ProductCTA> JSX.
 * Matches: [Voir le/la/l'/les X sur Y](url) on its own paragraph line.
 * Captures product name from link text (after "Voir le/la...").
 */
function autoProductCTA(content: string): string {
  // Matches a line that is ONLY a markdown link whose text starts with "Voir"
  return content.replace(
    /^(\[Voir (?:le |la |les |l')?([^\]]+?) sur ([^\]]+)\])\(([^)]+)\)\s*$/gm,
    (_match, _full, productName, domain, url) => {
      const name = productName.trim()
      const label = `Voir sur ${domain.trim()}`
      return `<ProductCTA name="${name}" url="${url}" label="${label}" />`
    },
  )
}

/** Extract H2 headings from raw MDX for table of contents */
function extractHeadings(content: string): { id: string; text: string }[] {
  const headings: { id: string; text: string }[] = []
  const lines = content.split('\n')
  for (const line of lines) {
    const match = line.match(/^## (.+)/)
    if (match && match[1]) {
      const text = match[1].trim()
      const id = text
        .toLowerCase()
        .replace(/[^a-zà-ÿ0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      headings.push({ id, text })
    }
  }
  return headings
}

/** Extract FAQ from body content (## FAQ section with ### questions + paragraph answers) */
function extractFaqFromBody(content: string): FaqItem[] {
  const items: FaqItem[] = []
  const lines = content.split('\n')
  let inFaqSection = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''

    // Detect ## FAQ heading
    if (/^## FAQ\b/i.test(line)) {
      inFaqSection = true
      continue
    }

    // Exit FAQ section on next ## heading
    if (inFaqSection && /^## /.test(line) && !/^## FAQ\b/i.test(line)) {
      break
    }

    if (inFaqSection && /^### /.test(line)) {
      const question = line.replace(/^### /, '').trim()
      // Collect paragraph lines until next heading or end
      const answerLines: string[] = []
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j] ?? ''
        if (/^#{1,3} /.test(nextLine)) break
        answerLines.push(nextLine)
      }
      const answer = answerLines.join('\n').trim()
      if (question && answer) {
        items.push({ question, answer })
      }
    }
  }
  return items
}

export default async function ArticlePage({ params }: PageProps) {
  const { locale, categorie, slug } = await params
  const article = getArticleMdx(locale, categorie, slug)
  if (!article) notFound()

  const author = getAuthor(article.authorSlug)
  const frontmatterFaq = (article as ArticleFaq).faq ?? []
  const processedContent = autoProductCTA(article.content)
  // Use frontmatter FAQ if available, otherwise extract from ## FAQ section in body
  const faq = frontmatterFaq.length > 0 ? frontmatterFaq : extractFaqFromBody(processedContent)
  const wordCount = processedContent.split(/\s+/).length
  const headings = extractHeadings(processedContent)
  const [chunk1, chunk2, chunk3] = splitContentIntoChunks(processedContent)
  const articleUrl = `https://www.mon-aspirateur.be/${locale}/blog/${categorie}/${slug}`
  const MDX_COMPONENTS = makeMdxComponents(article.title, articleUrl)

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

      <ReadingProgress />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(180deg, var(--accent-1-soft) 0%, var(--bg-primary) 100%)',
        padding: 'clamp(2.5rem, 6vw, 4rem) 1.5rem',
        borderBottom: '1px solid var(--border-light)',
        overflow: 'hidden',
      }}>
        <NoiseOverlay />
        <div style={{ maxWidth: 740, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Breadcrumb */}
          <nav aria-label="Fil d'Ariane" style={{ marginBottom: '1.25rem' }}>
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

          {/* Category badge + reading time */}
          <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-block',
              padding: '.25rem .7rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '.72rem',
              fontWeight: 700,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: 'var(--accent-1)',
              background: 'var(--accent-1-soft)',
            }}>
              {article.category}
            </span>
            <span style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>
              {article.readingTimeMin} min · {wordCount} {locale === 'fr' ? 'mots' : 'words'}
            </span>
          </div>

          <h1 className="typo-h1-article animate-fade-up" style={{ margin: '0 0 1.25rem' }}>
            {article.title}
          </h1>

          <p className="animate-fade-up delay-100" style={{
            fontSize: 'clamp(1rem, 2vw, 1.1rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            margin: '0 0 1.75rem',
            maxWidth: '60ch',
          }}>
            {article.excerpt}
          </p>

          {author && (
            <div className="animate-fade-up delay-200">
              <AuthorByline
                authorSlug={author.slug}
                authorName={author.name}
                publishedAt={article.publishedAt}
                updatedAt={article.updatedAt}
                readingTimeMin={article.readingTimeMin}
                locale={locale}
              />
            </div>
          )}
        </div>
      </section>

      {/* ── ARTICLE BODY ─────────────────────────────────────────── */}
      <div style={{ maxWidth: 740, margin: '0 auto', padding: 'clamp(2rem, 5vw, 3rem) 1.5rem' }}>

        {/* Table of contents */}
        <TableOfContents items={headings} />

        <article className="prose-article">
          <MDXRemote source={chunk1} components={MDX_COMPONENTS} options={MDX_OPTIONS} />
          {article.image1 && (
            <ArticleImage src={article.image1} alt={article.image1Alt} caption={article.image1Caption} />
          )}
          {chunk2 && <MDXRemote source={chunk2} components={MDX_COMPONENTS} options={MDX_OPTIONS} />}
          {article.image2 && (
            <ArticleImage src={article.image2} alt={article.image2Alt} caption={article.image2Caption} />
          )}
          {chunk3 && <MDXRemote source={chunk3} components={MDX_COMPONENTS} options={MDX_OPTIONS} />}
          {article.image3 && (
            <ArticleImage src={article.image3} alt={article.image3Alt} caption={article.image3Caption} />
          )}
        </article>

        {/* FAQ */}
        {faq.length > 0 && (
          <section style={{
            marginTop: '3rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          }}>
            <FaqAccordion items={faq} title={locale === 'fr' ? 'Questions fréquentes' : 'FAQ'} />
          </section>
        )}

        {/* Author card */}
        {author && (
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-light)' }}>
            <AuthorCard author={author} variant="inline" locale={locale} />
          </div>
        )}

        {/* Back link */}
        <div style={{
          marginTop: '2.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
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
          <Link
            href="#"
            onClick={undefined}
            style={{
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '.8rem',
            }}
          >
            ↑ {locale === 'fr' ? 'Haut de page' : 'Back to top'}
          </Link>
        </div>
      </div>
    </>
  )
}
