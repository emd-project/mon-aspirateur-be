// ISR 1800s — Article blog · MDX + JSON-LD Article + FAQPage
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { getArticleMdx, getAllArticleParams } from '@/lib/content/articles'
import { processShortcodes } from '@/lib/content/shortcodes'
import { extractFaqFromBody, stripFaqSection } from '@/lib/content/faq-extract'
import { autoProductCTA } from '@/lib/content/auto-cta'
import { normalizeMdxWhitespace } from '@/lib/content/normalize'
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
import ProductCard from '@/components/mdx/ProductCard'
import ProductCarousel from '@/components/mdx/ProductCarousel'
import type { FaqItem } from '@/lib/data/types'

export const revalidate = 1800

type PageProps = { params: Promise<{ locale: string; categorie: string; slug: string }> }

const MDX_COMPONENTS = { Tip, Warning, Verdict, PullQuote, StatCard, ProConTable, AISummarize, TLDRBox, ProductCTA, ArticleImage, ProductCard, ProductCarousel }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MDX_OPTIONS = { mdxOptions: { remarkPlugins: [remarkGfm] as any } }

/** Auto-inject <AISummarize> at the top of articles that don't already have one */
function autoInjectAISummarize(content: string, title: string): string {
  if (content.includes('<AISummarize')) return content
  const q = title.replace(/"/g, '&quot;')
  return `<AISummarize question="${q}" />\n\n${content}`
}

/** Inject title + articleUrl into every <AISummarize .../> in the MDX source (handles multiline tags) */
function injectAISummarizeMeta(content: string, title: string, articleUrl: string): string {
  const t = title.replace(/"/g, '&quot;')
  const u = articleUrl.replace(/"/g, '&quot;')
  return content.replace(
    /(<AISummarize)([\s\S]*?)(\/?>)/g,
    (_m, open, attrs, close) => {
      if (attrs.includes('title=') || attrs.includes('articleUrl=')) return _m
      return `${open}${attrs} title="${t}" articleUrl="${u}"${close}`
    },
  )
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
    alternates: {
      canonical: `/${locale}/blog/${article.categorySlug}/${slug}`,
      languages: {
        fr: `/fr/blog/${article.categorySlug}/${slug}`,
        en: `/en/blog/${article.categorySlug}/${slug}`,
      },
    },
  }
}

// Extract FAQ items from MDX frontmatter (optional field)
type ArticleFaq = { faq?: FaqItem[] }

/**
 * Block JSX tags that, once opened, must stay in the same chunk as their
 * closing tag. Shortcodes already expanded into JSX by processShortcodes.
 */
const BLOCK_JSX_TAGS = ['Tip', 'Warning', 'Verdict', 'PullQuote', 'AISummarize', 'TLDRBox', 'ProConTable', 'StatCard', 'ProductCard', 'ProductCarousel', 'ProductCTA', 'ArticleImage']

/** True if cutting between `blocks[i]` and `blocks[i+1]` would split a JSX block. */
function isInsideJsxBlock(blocks: string[], index: number): boolean {
  const upTo = blocks.slice(0, index + 1).join('\n\n')
  for (const tag of BLOCK_JSX_TAGS) {
    const opens = (upTo.match(new RegExp(`<${tag}(\\s|>)`, 'g')) ?? []).length
    const closes = (upTo.match(new RegExp(`</${tag}>`, 'g')) ?? []).length
    const selfClose = (upTo.match(new RegExp(`<${tag}[^>]*/>`, 'g')) ?? []).length
    if (opens - selfClose > closes) return true
  }
  return false
}

/**
 * Split MDX content into up to 3 chunks at paragraph boundaries,
 * targeting the 1/3 and 2/3 word-count marks. Never cuts inside a JSX block.
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
    if (split1 === -1 && wordsSoFar >= target1 && !isInsideJsxBlock(blocks, i)) split1 = i
    if (split1 !== -1 && split2 === -1 && wordsSoFar >= target2 && !isInsideJsxBlock(blocks, i) && i > split1) { split2 = i; break }
  }

  if (split1 === -1 || split2 === -1 || split1 >= split2) return [content, '', '']

  const chunk1 = blocks.slice(0, split1 + 1).join('\n\n')
  const chunk2 = blocks.slice(split1 + 1, split2 + 1).join('\n\n')
  const chunk3 = blocks.slice(split2 + 1).join('\n\n')
  return [chunk1, chunk2, chunk3]
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

export default async function ArticlePage({ params }: PageProps) {
  const { locale, categorie, slug } = await params
  const article = getArticleMdx(locale, categorie, slug)
  if (!article) notFound()

  const author = getAuthor(article.authorSlug)
  const frontmatterFaq = (article as ArticleFaq).faq ?? []
  const processedContent = autoInjectAISummarize(autoProductCTA(processShortcodes(normalizeMdxWhitespace(article.content))), article.title)
  // Frontmatter FAQ prioritaire, sinon on l'extrait du corps (formats `### Q?` ou `**Q?**`)
  const faq = frontmatterFaq.length > 0 ? frontmatterFaq : extractFaqFromBody(processedContent)
  // L'accordéon affiche déjà la FAQ en bas — on retire la section `## FAQ` du corps
  // pour éviter le doublon visuel hérité des imports Google Docs.
  const bodyContent = faq.length > 0 ? stripFaqSection(processedContent) : processedContent
  const wordCount = bodyContent.split(/\s+/).length
  const headings = extractHeadings(bodyContent)
  const articleUrl = `https://www.mon-aspirateur.be/${locale}/blog/${categorie}/${slug}`
  const finalContent = injectAISummarizeMeta(bodyContent, article.title, articleUrl)
  const [chunk1, chunk2, chunk3] = splitContentIntoChunks(finalContent)

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

      {/* ── HERO ──────────────────────────────────── */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(180deg, var(--accent-1-soft) 0%, var(--bg-primary) 100%)',
        padding: 'clamp(2.5rem, 6vw, 4rem) 1.5rem',
        borderBottom: '1px solid var(--border-light)',
        overflow: 'hidden',
      }}>
        {article.image1 && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${article.image1})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.07,
              mixBlendMode: 'multiply',
              pointerEvents: 'none',
            }}
          />
        )}
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

      {/* ── ARTICLE BODY ────────────────────────── */}
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
