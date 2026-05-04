import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { getAllBrands } from '@/lib/content/brands'

export const revalidate = 3600

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'marques.meta' })
  return { title: t('title'), description: t('description') }
}

export default async function MarquesPage({ params }: Props) {
  const { locale } = await params
  const t    = await getTranslations({ locale, namespace: 'marques' })
  const base = `/${locale}`
  const brands = getAllBrands().sort((a, b) => a.name.localeCompare(b.name))

  return (
    <main id="main-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>

      <header style={{ marginBottom: '3rem' }}>
        <p className="typo-overline" style={{ color: 'var(--accent-1)', marginBottom: '.5rem' }}>Marques</p>
        <h1 className="typo-h1-article" style={{ marginBottom: '.75rem' }}>{t('hub.title')}</h1>
        <p className="typo-lead">{t('hub.subtitle')}</p>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.25rem',
      }}>
        {brands.map(brand => (
          <Link key={brand.slug} href={`${base}/marques/${brand.slug}`} style={{ textDecoration: 'none' }}>
            <article className="card card-lift" style={{ padding: '1.5rem', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.75rem' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-playfair), Georgia, serif',
                    fontSize: '1.3rem',
                    fontWeight: 900,
                    color: 'var(--text-primary)',
                  }}
                >
                  {brand.name}
                </div>
                <span style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginTop: '.2rem' }}>
                  {brand.country}
                </span>
              </div>

              <p style={{ fontSize: '.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                {brand.positioning}
              </p>
            </article>
          </Link>
        ))}
      </div>
    </main>
  )
}
