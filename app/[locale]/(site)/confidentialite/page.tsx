// @cdc 5.0 — Politique de confidentialité · SSG · exception DA
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal.privacy.meta' })
  return { title: t('title'), description: t('description') }
}

export default async function ConfidentialitePage({ params }: PageProps) {
  const { locale } = await params
  const isFr = locale === 'fr'

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--space-16) var(--space-10)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-8)' }}>
        {isFr ? 'Politique de confidentialité' : 'Privacy policy'}
      </h1>

      {[
        {
          title: isFr ? 'Données collectées' : 'Data collected',
          body: isFr
            ? 'mon-aspirateur.be collecte des données d\'utilisation anonymisées via Plausible CE (auto-hébergé), sans cookie tiers. Aucune donnée personnelle identifiable n\'est collectée lors de votre navigation.'
            : 'mon-aspirateur.be collects anonymised usage data via Plausible CE (self-hosted), without third-party cookies. No personally identifiable data is collected during your browsing.',
        },
        {
          title: isFr ? 'Finalité du traitement' : 'Purpose of processing',
          body: isFr
            ? 'Les données d\'utilisation sont traitées dans le seul but d\'améliorer l\'expérience utilisateur et les contenus du site. Elles ne sont pas transmises à des tiers.'
            : 'Usage data is processed solely to improve the user experience and site content. It is not shared with third parties.',
        },
        {
          title: isFr ? 'Durée de conservation' : 'Retention period',
          body: isFr
            ? 'Les données d\'utilisation agrégées sont conservées indéfiniment sous forme anonymisée. Aucune donnée personnelle n\'est conservée.'
            : 'Aggregated usage data is retained indefinitely in anonymised form. No personal data is retained.',
        },
        {
          title: isFr ? 'Vos droits (RGPD)' : 'Your rights (GDPR)',
          body: isFr
            ? 'Conformément au RGPD et à la législation belge, vous disposez d\'un droit d\'accès, de rectification et de suppression de vos données. Pour exercer ces droits, contactez-nous via le formulaire disponible sur le site.'
            : 'In accordance with GDPR and Belgian law, you have the right to access, rectify and delete your data. To exercise these rights, contact us via the form available on the site.',
        },
      ].map(({ title, body }) => (
        <section key={title} style={{ marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
            {title}
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{body}</p>
        </section>
      ))}
    </main>
  )
}
