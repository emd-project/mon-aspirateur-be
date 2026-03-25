import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { currentYear } from '@/lib/utils/year'

export const dynamic = 'force-static'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'simulateur.meta' })
  return { title: t('title'), description: t('description') }
}

type PriceEvent = {
  slug:      string
  label:     string
  month:     string
  discount:  string
  tip:       string
  highlight: boolean
  color:     string
}

const priceEvents: PriceEvent[] = [
  {
    slug:      'soldes-janvier',
    label:     'Soldes janvier',
    month:     'Janvier',
    discount:  '-15 à -25 %',
    tip:       'Bon pour les traîneaux Rowenta et Miele. Moins agressif que le Black Friday.',
    highlight: false,
    color:     'var(--color-traineau)',
  },
  {
    slug:      'prime-day',
    label:     'Prime Day',
    month:     'Juillet',
    discount:  '-20 à -40 %',
    tip:       'Le meilleur moment pour les robots Roborock et Dreame. Préparez votre liste en juin.',
    highlight: true,
    color:     'var(--color-robot)',
  },
  {
    slug:      'rentree',
    label:     'Rentrée',
    month:     'Août – Septembre',
    discount:  '-10 à -20 %',
    tip:       'Promotions sur les laveurs de sol et les balais d\'entrée de gamme.',
    highlight: false,
    color:     'var(--color-laveur)',
  },
  {
    slug:      'black-friday',
    label:     'Black Friday',
    month:     'Novembre',
    discount:  '-25 à -45 %',
    tip:       'La plus grosse remise de l\'année sur les Dyson V15 et Samsung Bespoke. À surveiller 2 semaines avant.',
    highlight: true,
    color:     'var(--color-balai)',
  },
  {
    slug:      'cyber-monday',
    label:     'Cyber Monday',
    month:     'Novembre (lundi)',
    discount:  '-15 à -30 %',
    tip:       'Bonnes affaires sur les modèles Xiaomi et Bosch qui n\'ont pas été soldés le vendredi.',
    highlight: false,
    color:     'var(--color-accessoires)',
  },
  {
    slug:      'noel',
    label:     'Fêtes de fin d\'année',
    month:     'Décembre',
    discount:  '-10 à -15 %',
    tip:       'Remises modestes. Si vous avez raté le Black Friday, attendez les soldes de janvier.',
    highlight: false,
    color:     'var(--color-traineau)',
  },
]

export default async function SimulateurPage({ params }: Props) {
  const { locale } = await params
  const t    = await getTranslations({ locale, namespace: 'simulateur' })
  const year = currentYear()
  const base = `/${locale}`

  return (
    <main id="main-content" style={{ maxWidth: '860px', margin: '0 auto', padding: '3rem 1.5rem' }}>

      <header style={{ marginBottom: '3rem' }}>
        <p className="typo-overline" style={{ color: 'var(--accent-1)', marginBottom: '.5rem' }}>
          Calendrier des prix {year}
        </p>
        <h1 className="typo-h1-article" style={{ marginBottom: '.75rem' }}>{t('title')}</h1>
        <p className="typo-lead" style={{ maxWidth: '580px' }}>{t('subtitle')}</p>
      </header>

      {/* Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {priceEvents.map(event => (
          <article
            key={event.slug}
            className="card"
            style={{
              padding: '1.25rem 1.5rem',
              borderLeft: `4px solid ${event.color}`,
              borderRadius: '0 var(--radius-md) var(--radius-md) 0',
              background: event.highlight ? 'var(--bg-surface)' : 'var(--bg-subtle)',
              boxShadow: event.highlight ? 'var(--shadow-md)' : 'none',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '.5rem' }}>
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-playfair), Georgia, serif',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  {event.label}
                </span>
                <span style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginLeft: '.6rem' }}>
                  {event.month}
                </span>
              </div>

              <span style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontWeight: 900,
                fontSize: '1.25rem',
                color: event.color,
                whiteSpace: 'nowrap',
              }}>
                {event.discount}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {event.tip}
            </p>
          </article>
        ))}
      </div>

      {/* CTA */}
      <div
        className="verdict-box"
        style={{ marginTop: '3rem' }}
      >
        <p style={{ margin: '0 0 .5rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700, fontSize: '1rem', color: 'var(--accent-1)' }}>
          Notre verdict
        </p>
        <p style={{ margin: 0, lineHeight: 1.65, color: 'var(--text-secondary)', fontSize: '.95rem' }}>
          En clair : si vous pouvez attendre, le Prime Day en juillet et le Black Friday en novembre sont les deux moments à ne pas rater.
          Le reste de l&apos;année, les remises sont marginales. Créez une alerte prix sur Amazon pour votre modèle cible et soyez patient.
        </p>
        <p style={{ margin: '.75rem 0 0' }}>
          <a href={`${base}/comparer/balai`} style={{ color: 'var(--accent-1)', fontWeight: 600, textDecoration: 'none', fontSize: '.9rem' }}>
            Voir nos comparatifs pour choisir votre modèle →
          </a>
        </p>
      </div>

    </main>
  )
}
