// ISR 3600 — Guide éditorial "quel X choisir"
import type { Metadata } from 'next'
import { getTopPicksByCategory } from '@/lib/data/brands'
import { categoryMeta, categoryOrder } from '@/lib/data/comparateur'
import type { ProductCategory } from '@/lib/data/types'
import ProductCTA from '@/components/ui/ProductCTA'
import Verdict from '@/components/ui/Verdict'
import PullQuote from '@/components/ui/PullQuote'
import { notFound } from 'next/navigation'

export const revalidate = 3600

type PageProps = { params: Promise<{ locale: string; categorie: string }> }

const EXCLUDED: ProductCategory[] = ['accessoires']

export async function generateStaticParams() {
  const locales = ['fr', 'en']
  const categories = categoryOrder.filter((c): c is ProductCategory => !EXCLUDED.includes(c))
  return locales.flatMap((locale) =>
    categories.map((categorie) => ({ locale, categorie }))
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, categorie } = await params
  const category = categorie as ProductCategory
  if (!categoryMeta[category] || EXCLUDED.includes(category)) return {}
  const meta = categoryMeta[category]
  return {
    title: locale === 'fr'
      ? `Quel ${meta.label.toLowerCase()} choisir ? Guide complet — mon-aspirateur.be`
      : `Which ${meta.labelEn.toLowerCase()} to choose? Complete guide — mon-aspirateur.be`,
    description: meta.description,
    alternates: {
      canonical: `/${locale}/choisir/${categorie}`,
      languages: { fr: `/fr/choisir/${categorie}`, en: `/en/choisir/${categorie}` },
    },
  }
}

type VerdictPoint = { text: string }

const verdictPoints: Record<string, VerdictPoint[]> = {
  balai: [
    { text: 'Vous aspirez souvent (2-3× par semaine) et voulez que ce soit rapide.' },
    { text: 'Vous avez un logement de moins de 120 m² sans moquette épaisse.' },
    { text: 'Vous cherchez un seul outil passe-partout qui tient debout tout seul.' },
  ],
  robot: [
    { text: 'Vous voulez un sol propre sans y penser — idéal pour les plannings chargés.' },
    { text: 'Vous avez des sols principalement durs (parquet, carrelage, vinyle).' },
    { text: 'Vous êtes prêt à investir pour gagner vraiment du temps au quotidien.' },
  ],
  traineau: [
    { text: 'Vous avez des tapis épais, des moquettes ou un habitat de plus de 100 m².' },
    { text: 'Vous êtes sensible aux allergies et avez besoin d\'un filtre HEPA certifié.' },
    { text: 'Vous préférez une puissance constante sans vous soucier de la batterie.' },
  ],
  laveur: [
    { text: 'Vous avez des sols durs (carrelage, vinyle, parquet) et voulez aspirer + laver en un passage.' },
    { text: 'Vous avez des enfants ou des animaux et votre sol a besoin d\'un vrai lavage régulier.' },
    { text: 'Vous êtes prêt à entretenir l\'appareil (cuve, brosses) après chaque usage.' },
  ],
}

const honestTips: Record<string, string> = {
  balai: "Honnêtement, un Dreame T30 à 399€ fait 90% du boulot d'un Dyson V15 à 699€. La différence se voit surtout sur tapis épais.",
  robot: "Le vrai tip : achetez un robot avec LiDAR même basique. Les robots à navigation aléatoire font des aller-retours inutiles et ratent des zones.",
  traineau: "En clair : si vous avez un grand appartement en location et des tapis, le traîneau reste imbattable. Pour le reste, un bon balai suffit.",
  laveur: "Le vrai tip : un laveur sans autovidage ça pue si vous oubliez de vider la cuve. Tineco S7 Pro ou rien.",
}

export default async function ChoisirCategoriePage({ params }: PageProps) {
  const { locale, categorie } = await params
  const category = categorie as ProductCategory

  if (!categoryMeta[category] || EXCLUDED.includes(category)) notFound()

  const meta = categoryMeta[category]
  const topPicks = getTopPicksByCategory(category).slice(0, 3)
  const points = verdictPoints[category] ?? []
  const tip = honestTips[category] ?? ''

  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: 'var(--space-10)' }}>
      {/* Header */}
      <header style={{ marginBottom: 'var(--space-10)' }}>
        <p className="typo-overline" style={{ marginBottom: 'var(--space-2)' }}>
          {locale === 'fr' ? 'Guide d\'achat' : 'Buying guide'}
        </p>
        <h1
          className="typo-h1-article"
          style={{ marginBottom: 'var(--space-4)', color: meta.color }}
        >
          {locale === 'fr'
            ? `Quel ${meta.label.toLowerCase()} choisir ?`
            : `Which ${meta.labelEn.toLowerCase()} should you choose?`}
        </h1>
        <p className="typo-lead">{meta.description}</p>
      </header>

      {/* Section 1: Pour qui ? */}
      <section aria-labelledby="pour-qui" style={{ marginBottom: 'var(--space-10)' }}>
        <h2 id="pour-qui" className="typo-h2" style={{ marginBottom: 'var(--space-4)' }}>
          {locale === 'fr' ? 'Pour qui ?' : 'Who is it for?'}
        </h2>
        <Verdict title={locale === 'fr' ? 'Ce type est fait pour vous si…' : 'This type is right for you if…'}>
          <ul style={{ margin: 0, padding: '0 0 0 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {points.map((point, i) => (
              <li key={i} style={{ lineHeight: 1.6 }}>{point.text}</li>
            ))}
          </ul>
        </Verdict>
      </section>

      {/* Section 2: Notre top 3 */}
      <section aria-labelledby="top3" style={{ marginBottom: 'var(--space-10)' }}>
        <h2 id="top3" className="typo-h2" style={{ marginBottom: 'var(--space-6)' }}>
          {locale === 'fr' ? 'Notre top 3' : 'Our top 3'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
          {topPicks.map((pick) => (
            <ProductCTA
              key={pick.name}
              name={pick.name}
              brand={pick.brandName}
              priceEur={pick.priceEur}
              score={pick.score}
              highlight={pick.highlight}
              affiliateUrl={pick.affiliateUrl}
              category={category}
              isTopPick={pick.isTopPick}
            />
          ))}
        </div>
      </section>

      {/* Section 3: Honest tip */}
      {tip && (
        <section aria-label={locale === 'fr' ? 'Conseil honnête' : 'Honest advice'}>
          <h2 className="typo-h2" style={{ marginBottom: 'var(--space-4)' }}>
            {locale === 'fr' ? 'Le conseil honnête' : 'The honest advice'}
          </h2>
          <PullQuote quote={tip} category={category} />
        </section>
      )}
    </main>
  )
}
