// Hub guides d'achat — index des pages choisir/[categorie].
// Contrainte de routage : les clés listées ici DOIVENT matcher les slugs
// générés par choisir/[categorie]/generateStaticParams (categoryOrder moins EXCLUDED),
// sinon les liens pointent sur des 404.
import type { Metadata } from 'next'
import Link from 'next/link'
import { categoryOrder, categoryMeta } from '@/lib/data/comparateur'
import { getAllCmsProducts } from '@/lib/content/products'
import type { ProductCategory } from '@/lib/data/types'

export const revalidate = 3600

type Props = { params: Promise<{ locale: string }> }

const BASE_URL = 'https://www.mon-aspirateur.be'

/** Doit rester identique à EXCLUDED dans choisir/[categorie]/page.tsx */
const EXCLUDED: ProductCategory[] = ['accessoires']

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'fr'
      ? 'Quel aspirateur choisir ? Nos guides d\'achat | Mon Aspirateur'
      : 'Which vacuum cleaner to choose? Our buying guides | Mon Aspirateur',
    description: locale === 'fr'
      ? 'Robot, balai, traîneau ou laveur : nos guides d\'achat vous disent clairement quel type d\'aspirateur correspond à votre logement et à votre budget.'
      : 'Robot, cordless stick, canister or floor washer: our buying guides tell you plainly which type fits your home and budget.',
    alternates: {
      canonical: `/${locale}/choisir`,
      languages: { fr: '/fr/choisir', en: '/en/choisir' },
    },
  }
}

/** Amorce éditoriale — pour qui chaque type d'aspirateur est fait. */
const pitch: Record<string, { fr: string; en: string }> = {
  balai: {
    fr: 'Vous aspirez souvent et vite, sur moins de 120 m², sans moquette épaisse.',
    en: 'You vacuum often and fast, under 120 m², with no thick carpet.',
  },
  robot: {
    fr: 'Vous voulez un sol propre sans y penser, sur des sols majoritairement durs.',
    en: 'You want clean floors without thinking about it, on mostly hard floors.',
  },
  traineau: {
    fr: 'Vous avez des tapis épais, des moquettes ou plus de 100 m² à couvrir.',
    en: 'You have thick rugs, carpets, or more than 100 m² to cover.',
  },
  laveur: {
    fr: 'Vos sols sont durs et vous voulez aspirer et laver en un seul passage.',
    en: 'Your floors are hard and you want to vacuum and mop in one pass.',
  },
}

export default async function ChoisirHubPage({ params }: Props) {
  const { locale } = await params
  const base = `/${locale}`
  const products = getAllCmsProducts()

  // Catégories dont la page choisir/[categorie] existe réellement
  const categories = categoryOrder
    .filter((cat): cat is ProductCategory => !EXCLUDED.includes(cat) && Boolean(categoryMeta[cat]))
    .map(cat => {
      const inCat = products.filter(p => p.category === cat)
      const best = [...inCat].sort((a, b) => b.rating - a.rating)[0]
      const cheapest = [...inCat].sort((a, b) => a.priceEur - b.priceEur)[0]
      return { slug: cat, meta: categoryMeta[cat], count: inCat.length, best, cheapest }
    })

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: locale === 'fr' ? "Guides d'achat aspirateur" : 'Vacuum buying guides',
    url: `${BASE_URL}/${locale}/choisir`,
    numberOfItems: categories.length,
    itemListElement: categories.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: locale === 'en' ? c.meta.labelEn : c.meta.label,
      url: `${BASE_URL}/${locale}/choisir/${c.slug}`,
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: locale === 'fr' ? 'Accueil' : 'Home', item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: locale === 'fr' ? 'Choisir' : 'Choose', item: `${BASE_URL}/${locale}/choisir` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <main id="main-content" style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem' }}>

        <header style={{ marginBottom: '2.5rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-light)' }}>
          <p className="typo-overline" style={{ color: 'var(--accent-1)', marginBottom: '.5rem' }}>
            {locale === 'fr' ? "Guides d'achat" : 'Buying guides'}
          </p>
          <h1 className="typo-h1-article" style={{ marginBottom: '.75rem' }}>
            {locale === 'fr' ? 'Quel aspirateur choisir ?' : 'Which vacuum should you choose?'}
          </h1>
          <p className="typo-lead" style={{ maxWidth: '58ch' }}>
            {locale === 'fr'
              ? "Un guide par type d'appareil. On vous dit pour qui c'est fait, ce que ça coûte, et quand ça ne vaut pas le coup."
              : 'One guide per type. Who it is for, what it costs, and when it is not worth it.'}
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {categories.map(cat => {
            const label = locale === 'en' ? cat.meta.labelEn : cat.meta.label
            const p = pitch[cat.slug]
            return (
              <Link key={cat.slug} href={`${base}/choisir/${cat.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                <article style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-light)',
                  borderLeft: `4px solid ${cat.meta.color}`,
                  borderRadius: '0 6px 6px 0',
                  padding: '1.5rem 1.75rem',
                }}>
                  <h2 style={{
                    fontFamily: 'var(--font-playfair), Georgia, serif',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    color: 'var(--text-primary)',
                    margin: '0 0 .5rem',
                  }}>
                    {locale === 'fr'
                      ? `Quel ${label.toLowerCase()} choisir ?`
                      : `Which ${label.toLowerCase()} to choose?`}
                  </h2>

                  {p && (
                    <p style={{ fontSize: '.9rem', color: 'var(--text-secondary)', margin: '0 0 .75rem', lineHeight: 1.6 }}>
                      {locale === 'fr' ? p.fr : p.en}
                    </p>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'baseline' }}>
                    {cat.count > 0 && (
                      <span style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                        {cat.count} {locale === 'fr' ? 'modèles comparés' : 'models compared'}
                      </span>
                    )}
                    {cat.cheapest && (
                      <span style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                        {locale === 'fr' ? 'À partir de ' : 'From '}
                        <strong style={{ color: 'var(--accent-1)' }}>{cat.cheapest.priceEur}&nbsp;€</strong>
                      </span>
                    )}
                    {cat.best && (
                      <span style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                        {locale === 'fr' ? 'Notre top : ' : 'Our top: '}
                        <strong style={{ color: 'var(--text-secondary)' }}>{cat.best.name}</strong>
                      </span>
                    )}
                    <span style={{ fontSize: '.85rem', color: 'var(--accent-1)', fontWeight: 600, marginLeft: 'auto' }}>
                      {locale === 'fr' ? 'Lire le guide' : 'Read the guide'} →
                    </span>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>

        {/* Renvoi vers le classement */}
        <div className="verdict-box" style={{ marginTop: '2.5rem' }}>
          <p style={{ margin: '0 0 .5rem', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700, fontSize: '1rem', color: 'var(--accent-1)' }}>
            {locale === 'fr' ? 'Vous savez déjà quel type il vous faut ?' : 'Already know which type you need?'}
          </p>
          <p style={{ margin: 0, lineHeight: 1.65, color: 'var(--text-secondary)', fontSize: '.95rem' }}>
            {locale === 'fr'
              ? 'Passez directement au classement : les modèles qu’on recommande, classés, avec leur prix relevé.'
              : 'Go straight to the ranking: the models we recommend, ranked, with their listed price.'}
          </p>
          <p style={{ margin: '.75rem 0 0' }}>
            <Link href={`${base}/classement`} style={{ color: 'var(--accent-1)', fontWeight: 600, textDecoration: 'none', fontSize: '.9rem' }}>
              {locale === 'fr' ? 'Voir le classement →' : 'See the ranking →'}
            </Link>
          </p>
        </div>

      </main>
    </>
  )
}
