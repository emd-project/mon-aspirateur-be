// @cdc 5.0 — Guide détail · ISR 3600s · JSON-LD Article
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { currentYear } from '@/lib/utils/year'
import { getGuide, getGuides } from '@/lib/data/mock/guides'
import { getAuthor } from '@/lib/data/mock/authors'
import AuthorByline from '@/components/ui/AuthorByline'
import AuthorCard from '@/components/ui/AuthorCard'
import FaqAccordion from '@/components/ui/FaqAccordion'
import SectionDivider from '@/components/effects/SectionDivider'
import NoiseOverlay from '@/components/effects/NoiseOverlay'

export const revalidate = 3600

type PageProps = { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams() {
  const fr = getGuides('fr').map((g) => ({ locale: 'fr', slug: g.slug }))
  const en = getGuides('en').map((g) => ({ locale: 'en', slug: g.slug }))
  return [...fr, ...en]
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const guide = getGuide(slug, locale)
  if (!guide) return {}
  const year = currentYear()
  return {
    title: `${guide.title} ${year} | mon-aspirateur.be`,
    description: guide.excerpt,
    alternates: { canonical: `/${locale}/guides/${slug}` },
  }
}

// Minimal markdown-to-JSX — headings, paragraphs, lists, bold, tables
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
    } else if (line.startsWith('| ')) {
      // table — collect rows
      const rows: string[][] = []
      while (i < lines.length && (lines[i] ?? '').startsWith('|')) {
        const cells = (lines[i] ?? '').split('|').slice(1, -1).map((c) => c.trim())
        if (!cells.every((c) => /^[-:]+$/.test(c))) rows.push(cells)
        i++
      }
      elements.push(
        <div key={`table-${i}`} style={{ overflowX: 'auto', margin: 'var(--space-6) 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
            <thead>
              <tr>{(rows[0] ?? []).map((cell, ci) => <th key={ci} style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left', borderBottom: '2px solid var(--border-strong)', color: 'var(--text-primary)', fontWeight: 700 }}>{cell}</th>)}</tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, ri) => (
                <tr key={ri} style={{ borderBottom: '1px solid var(--border)' }}>
                  {row.map((cell, ci) => <td key={ci} style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)' }}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      continue
    } else if (line.startsWith('- ')) {
      const items: string[] = []
      while (i < lines.length && (lines[i] ?? '').startsWith('- ')) {
        items.push((lines[i] ?? '').slice(2))
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ margin: 'var(--space-4) 0', paddingLeft: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {items.map((item, ii) => <li key={ii} style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />)}
        </ul>
      )
      continue
    } else if (line.trim() !== '') {
      elements.push(<p key={i} style={{ margin: 'var(--space-4) 0', color: 'var(--text-secondary)', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>') }} />)
    }

    i++
  }
  return elements
}

export default async function GuideDetailPage({ params }: PageProps) {
  const { locale, slug } = await params
  const guide = getGuide(slug, locale)
  if (!guide) notFound()

  const author = getAuthor(guide.authorSlug)
  const t = await getTranslations({ locale, namespace: 'blog' })

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt ?? guide.publishedAt,
    author: { '@type': 'Person', name: author?.name ?? 'Thomas V.', url: `https://mon-aspirateur.be/${locale}/auteurs/thomas-v` },
    publisher: { '@type': 'Organization', name: 'mon-aspirateur.be' },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: locale === 'fr' ? 'Accueil' : 'Home', item: `https://mon-aspirateur.be/${locale}` },
      { '@type': 'ListItem', position: 2, name: locale === 'fr' ? 'Guides' : 'Guides', item: `https://mon-aspirateur.be/${locale}/guides` },
      { '@type': 'ListItem', position: 3, name: guide.title, item: `https://mon-aspirateur.be/${locale}/guides/${slug}` },
    ],
  }

  const faqJsonLd = guide.faq && guide.faq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faq.map((item) => ({
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

      {/* Hero article — fond --bg-surface + Playfair H1 */}
      <section style={{ position: 'relative', background: 'var(--bg-surface)', padding: 'var(--space-16) var(--space-10)', overflow: 'hidden' }}>
        <NoiseOverlay />
        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Breadcrumb */}
          <nav aria-label="Fil d'Ariane" style={{ marginBottom: 'var(--space-6)' }}>
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-muted)' }}>
              <li><Link href={`/${locale}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{locale === 'fr' ? 'Accueil' : 'Home'}</Link></li>
              <li aria-hidden="true">›</li>
              <li><Link href={`/${locale}/guides`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{locale === 'fr' ? 'Guides' : 'Guides'}</Link></li>
              <li aria-hidden="true">›</li>
              <li style={{ color: 'var(--accent-1)' }}>{guide.title}</li>
            </ol>
          </nav>

          <h1 className="typo-h1-article" style={{ margin: '0 0 var(--space-6)' }}>
            {guide.title}
          </h1>

          {author && (
            <AuthorByline
              authorSlug={author.slug}
              authorName={author.name}
              publishedAt={guide.publishedAt}
              updatedAt={guide.updatedAt}
              readingTimeMin={guide.readingTimeMin}
              locale={locale}
            />
          )}
        </div>
      </section>

      <SectionDivider variant="diagonal" fill="var(--bg-primary)" flipY />

      {/* Corps */}
      <article style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--space-12) var(--space-10)' }}>
        {renderBody(guide.body)}

        {/* FAQ */}
        {guide.faq && guide.faq.length > 0 && (
          <div style={{ marginTop: 'var(--space-12)' }}>
            <FaqAccordion items={guide.faq} title={t('faq')} />
          </div>
        )}

        {/* AuthorCard */}
        {author && (
          <div style={{ marginTop: 'var(--space-12)' }}>
            <AuthorCard author={author} variant="inline" locale={locale} />
          </div>
        )}

        {/* Retour hub */}
        <div style={{ marginTop: 'var(--space-10)', paddingTop: 'var(--space-8)', borderTop: '1px solid var(--border)' }}>
          <Link href={`/${locale}/guides`} style={{ color: 'var(--accent-1)', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
            ← {locale === 'fr' ? 'Tous les guides' : 'All guides'}
          </Link>
        </div>
      </article>
    </>
  )
}
