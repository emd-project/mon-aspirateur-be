// @cdc 5.0 — Comparatif détail · ISR 3600s · JSON-LD Article
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { currentYear } from '@/lib/utils/year'
import { getComparatif, getComparatifs } from '@/lib/data/mock/comparatifs'
import { getAuthor } from '@/lib/data/mock/authors'
import AuthorByline from '@/components/ui/AuthorByline'
import AuthorCard from '@/components/ui/AuthorCard'
import SectionDivider from '@/components/effects/SectionDivider'
import NoiseOverlay from '@/components/effects/NoiseOverlay'

export const revalidate = 3600

type PageProps = { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams() {
  const fr = getComparatifs('fr').map((c) => ({ locale: 'fr', slug: c.slug }))
  const en = getComparatifs('en').map((c) => ({ locale: 'en', slug: c.slug }))
  return [...fr, ...en]
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const comp = getComparatif(slug, locale)
  if (!comp) return {}
  const year = currentYear()
  return {
    title: `${comp.brandA} vs ${comp.brandB} ${year} | mon-aspirateur.be`,
    description: comp.excerpt,
    alternates: { canonical: `/${locale}/comparatifs/${slug}` },
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
    } else if (line.startsWith('| ')) {
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
      while (i < lines.length && (lines[i] ?? '').startsWith('- ')) { items.push((lines[i] ?? '').slice(2)); i++ }
      elements.push(<ul key={`ul-${i}`} style={{ margin: 'var(--space-4) 0', paddingLeft: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>{items.map((item, ii) => <li key={ii} style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />)}</ul>)
      continue
    } else if (line.trim() !== '') {
      elements.push(<p key={i} style={{ margin: 'var(--space-4) 0', color: 'var(--text-secondary)', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>') }} />)
    }
    i++
  }
  return elements
}

export default async function ComparatifDetailPage({ params }: PageProps) {
  const { locale, slug } = await params
  const comp = getComparatif(slug, locale)
  if (!comp) notFound()

  const author = getAuthor(comp.authorSlug)
  const t = await getTranslations({ locale, namespace: 'comparatifs' })

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: comp.title,
    datePublished: comp.publishedAt,
    dateModified: comp.publishedAt,
    author: { '@type': 'Person', name: author?.name ?? 'Thomas V.', url: `https://mon-aspirateur.be/${locale}/auteurs/thomas-v` },
    publisher: { '@type': 'Organization', name: 'mon-aspirateur.be' },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      {/* Hero */}
      <section style={{ position: 'relative', background: 'var(--bg-surface-2)', padding: 'var(--space-16) var(--space-10)', overflow: 'hidden' }}>
        <NoiseOverlay />
        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <nav aria-label="Fil d'Ariane" style={{ marginBottom: 'var(--space-6)' }}>
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-muted)' }}>
              <li><Link href={`/${locale}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{locale === 'fr' ? 'Accueil' : 'Home'}</Link></li>
              <li aria-hidden="true">›</li>
              <li><Link href={`/${locale}/comparatifs`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{locale === 'fr' ? 'Comparatifs' : 'Comparisons'}</Link></li>
              <li aria-hidden="true">›</li>
              <li style={{ color: 'var(--accent-1)' }}>{comp.brandA} vs {comp.brandB}</li>
            </ol>
          </nav>

          {/* Brand badges */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
            <span style={{ padding: '6px 16px', background: 'var(--accent-1)', color: '#fff', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>{comp.brandA}</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '18px' }}>vs</span>
            <span style={{ padding: '6px 16px', background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>{comp.brandB}</span>
          </div>

          <h1 className="typo-h1-article" style={{ margin: '0 0 var(--space-6)' }}>
            {comp.title}
          </h1>

          {author && (
            <AuthorByline authorSlug={author.slug} authorName={author.name} publishedAt={comp.publishedAt} readingTimeMin={comp.readingTimeMin} locale={locale} />
          )}
        </div>
      </section>

      <SectionDivider variant="diagonal" fill="var(--bg-primary)" flipY />

      {/* Corps */}
      <article style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--space-12) var(--space-10)' }}>
        {renderBody(comp.body)}

        {/* Verdict highlight */}
        <div style={{ margin: 'var(--space-10) 0', padding: 'var(--space-6)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--accent-1)' }}>
          <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
            {t('verdict')} :
          </p>
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{comp.verdict}</p>
        </div>

        {author && (
          <div style={{ marginTop: 'var(--space-12)' }}>
            <AuthorCard author={author} variant="inline" locale={locale} />
          </div>
        )}

        <div style={{ marginTop: 'var(--space-10)', paddingTop: 'var(--space-8)', borderTop: '1px solid var(--border)' }}>
          <Link href={`/${locale}/comparatifs`} style={{ color: 'var(--accent-1)', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
            ← {locale === 'fr' ? 'Tous les comparatifs' : 'All comparisons'}
          </Link>
        </div>
      </article>
    </>
  )
}
