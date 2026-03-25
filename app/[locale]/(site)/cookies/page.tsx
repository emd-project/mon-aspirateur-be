// @cdc 5.0 — Politique cookies · SSG · exception DA
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal.cookies.meta' })
  return { title: t('title'), description: t('description') }
}

export default async function CookiesPage({ params }: PageProps) {
  const { locale } = await params
  const isFr = locale === 'fr'

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--space-16) var(--space-10)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-8)' }}>
        {isFr ? 'Politique de cookies' : 'Cookie policy'}
      </h1>

      <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', borderLeft: '4px solid var(--success)', padding: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.7, fontWeight: 600 }}>
          {isFr
            ? '✓ Ce site n\'utilise aucun cookie tiers. Votre vie privée est respectée par défaut.'
            : '✓ This site uses no third-party cookies. Your privacy is respected by default.'}
        </p>
      </div>

      {[
        {
          title: isFr ? 'Aucun cookie de tracking' : 'No tracking cookies',
          body: isFr
            ? 'mon-aspirateur.be n\'utilise pas Google Analytics, Facebook Pixel ni aucun autre outil de tracking tiers. Votre comportement de navigation n\'est pas partagé avec des annonceurs.'
            : 'mon-aspirateur.be does not use Google Analytics, Facebook Pixel or any other third-party tracking tool. Your browsing behaviour is not shared with advertisers.',
        },
        {
          title: isFr ? 'Plausible CE — analytics privacy-first' : 'Plausible CE — privacy-first analytics',
          body: isFr
            ? 'Nous utilisons Plausible CE (Community Edition, auto-hébergé) pour comprendre comment les visiteurs utilisent notre site. Plausible ne dépose aucun cookie et ne collecte aucune donnée personnelle identifiable. Conforme RGPD sans bandeau cookie requis.'
            : 'We use Plausible CE (Community Edition, self-hosted) to understand how visitors use our site. Plausible sets no cookies and collects no personally identifiable data. GDPR-compliant with no cookie banner required.',
        },
        {
          title: isFr ? 'Cookies techniques (session)' : 'Technical cookies (session)',
          body: isFr
            ? 'Le site peut utiliser un cookie de session pour mémoriser vos préférences (thème clair/sombre, langue). Ce cookie est strictement nécessaire, ne contient aucune donnée personnelle et expire à la fermeture du navigateur.'
            : 'The site may use a session cookie to remember your preferences (light/dark theme, language). This cookie is strictly necessary, contains no personal data, and expires when the browser is closed.',
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
