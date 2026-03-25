import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getTopPicksByCategory } from '@/lib/data/brands'
import { categoryOrder, categoryMeta } from '@/lib/data/comparateur'
import ProductCTA from '@/components/ui/ProductCTA'

export const dynamic = 'force-static'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'deals.meta' })
  return { title: t('title'), description: t('description') }
}

export default async function DealsPage({ params }: Props) {
  const { locale } = await params
  const t    = await getTranslations({ locale, namespace: 'deals' })

  return (
    <main id="main-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>

      <header style={{ marginBottom: '2.5rem' }}>
        <p className="typo-overline" style={{ color: 'var(--accent-1)', marginBottom: '.5rem' }}>Deals & Promos</p>
        <h1 className="typo-h1-article" style={{ marginBottom: '.75rem' }}>{t('title')}</h1>
        <p className="typo-lead" style={{ maxWidth: '600px' }}>{t('subtitle')}</p>
      </header>

      {/* Tip */}
      <div className="tip-box" style={{ marginBottom: '3rem', maxWidth: '680px' }}>
        <div style={{ fontSize: '1.25rem', flexShrink: 0 }}>💡</div>
        <p style={{ margin: 0, fontSize: '.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Le vrai tip :</strong>{' '}
          {t('tip')}
        </p>
      </div>

      {/* Top picks par catégorie (sans accessoires) */}
      {categoryOrder.slice(0, 4).map(cat => {
        const picks = getTopPicksByCategory(cat)
        if (picks.length === 0) return null
        const meta  = categoryMeta[cat]

        return (
          <section key={cat} style={{ marginBottom: '3.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.5rem' }}>
              <h2
                className="typo-h2"
                style={{ margin: 0, color: `var(--color-${cat})` }}
              >
                {meta.label}
              </h2>
              <span className={`badge badge-${cat}`}>Sélection du moment</span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}>
              {picks.slice(0, 3).map(p => (
                <ProductCTA
                  key={p.name}
                  name={p.name}
                  brand={''}
                  priceEur={p.priceEur}
                  score={p.score}
                  highlight={p.highlight}
                  affiliateUrl={p.affiliateUrl}
                  category={p.category}
                  isTopPick={p.isTopPick}
                />
              ))}
            </div>
          </section>
        )
      })}

    </main>
  )
}
