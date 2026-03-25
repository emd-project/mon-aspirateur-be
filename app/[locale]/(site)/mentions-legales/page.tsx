// @cdc 5.0 — Page légale · SSG · exception DA (fond uni autorisé)
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal.mentions.meta' })
  return { title: t('title'), description: t('description') }
}

export default async function MentionsLegalesPage({ params }: PageProps) {
  const { locale } = await params
  const isFr = locale === 'fr'

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--space-16) var(--space-10)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-8)' }}>
        {isFr ? 'Mentions légales' : 'Legal notice'}
      </h1>

      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
          {isFr ? 'Éditeur' : 'Publisher'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          {isFr
            ? 'Le site mon-aspirateur.be est édité à titre personnel. Responsable de la publication : Thomas V. Contact : via le formulaire de contact disponible sur le site.'
            : 'The site mon-aspirateur.be is published on a personal basis. Publication manager: Thomas V. Contact: via the contact form available on the site.'}
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
          {isFr ? 'Hébergement' : 'Hosting'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          Vercel Inc. — 340 Pine Street, Suite 701, San Francisco, CA 94104, USA.
          {isFr ? ' Région de déploiement : fra1 (Europe).' : ' Deployment region: fra1 (Europe).'}
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
          {isFr ? 'Propriété intellectuelle' : 'Intellectual property'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          {isFr
            ? 'L\'ensemble des contenus publiés sur mon-aspirateur.be (textes, analyses, guides) est protégé par le droit d\'auteur. Toute reproduction sans autorisation est interdite.'
            : 'All content published on mon-aspirateur.be (texts, analyses, guides) is protected by copyright. Any reproduction without authorisation is prohibited.'}
        </p>
      </section>

      <section>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
          {isFr ? 'Responsabilité' : 'Liability'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          {isFr
            ? 'Les informations publiées sur ce site sont données à titre indicatif. Les prix indiqués peuvent varier. Vérifiez toujours les prix actuels auprès des distributeurs avant tout achat.'
            : 'Information published on this site is provided for guidance only. Prices indicated may vary. Always verify current prices with retailers before purchasing.'}
        </p>
      </section>
    </main>
  )
}
