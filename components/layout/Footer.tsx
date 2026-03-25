import Link from 'next/link'

type FooterProps = {
  locale: string
  t: {
    navigation: string
    categories: string
    about: string
    legal: string
    privacy: string
    cookies: string
    madeIn: string
    authorLink: string
    guides: string
    comparatifs: string
    blog: string
    tools: string
  }
}

// SVG ligne décorative géométrique — effect-footer
function FooterDecorativeLine() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 24"
      preserveAspectRatio="none"
      style={{ display: 'block', width: '100%', height: 24, opacity: 0.15 }}
    >
      <polyline
        points="0,12 200,4 400,20 600,4 800,20 1000,4 1200,12"
        fill="none"
        stroke="var(--accent-2)"
        strokeWidth="1.5"
      />
      <circle cx="200" cy="4" r="3" fill="var(--accent-1)" />
      <circle cx="600" cy="4" r="3" fill="var(--accent-1)" />
      <circle cx="1000" cy="4" r="3" fill="var(--accent-1)" />
    </svg>
  )
}

export default function Footer({ locale, t }: FooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer
      role="contentinfo"
      style={{
        background: 'var(--text-primary)',
        color: 'var(--bg-surface)',
        paddingTop: 'var(--space-16)',
      }}
    >
      <FooterDecorativeLine />

      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: 'var(--space-12) var(--space-10)',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-8)',
        }}
      >
        {/* Col 1 — Navigation */}
        <div>
          <h3
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: 'var(--space-4)',
            }}
          >
            {t.navigation}
          </h3>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[
              { href: `/${locale}/guides`, label: t.guides },
              { href: `/${locale}/comparatifs`, label: t.comparatifs },
              { href: `/${locale}/blog`, label: t.blog },
              { href: `/${locale}/outils/quiz`, label: t.tools },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  style={{ color: 'var(--bg-surface-2)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.15s' }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 2 — Catégories */}
        <div>
          <h3
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: 'var(--space-4)',
            }}
          >
            {t.categories}
          </h3>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[
              { href: `/${locale}/guides/choisir-robot-aspirateur`, label: locale === 'fr' ? 'Robot aspirateur' : 'Robot vacuum' },
              { href: `/${locale}/guides`, label: locale === 'fr' ? 'Aspirateur balai sans fil' : 'Cordless vacuum' },
              { href: `/${locale}/comparatifs`, label: locale === 'fr' ? 'Comparatifs marques' : 'Brand comparisons' },
              { href: `/${locale}/outils/simulateur`, label: locale === 'fr' ? 'Simulateur superficie' : 'Area simulator' },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  style={{ color: 'var(--bg-surface-2)', textDecoration: 'none', fontSize: '14px' }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 — À propos */}
        <div>
          <h3
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: 'var(--space-4)',
            }}
          >
            {t.about}
          </h3>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <li>
              <Link
                href={`/${locale}/auteurs/thomas-v`}
                style={{ color: 'var(--bg-surface-2)', textDecoration: 'none', fontSize: '14px' }}
              >
                {t.authorLink}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/mentions-legales`}
                style={{ color: 'var(--bg-surface-2)', textDecoration: 'none', fontSize: '14px' }}
              >
                {t.legal}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/confidentialite`}
                style={{ color: 'var(--bg-surface-2)', textDecoration: 'none', fontSize: '14px' }}
              >
                {t.privacy}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/cookies`}
                style={{ color: 'var(--bg-surface-2)', textDecoration: 'none', fontSize: '14px' }}
              >
                {t.cookies}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: 'var(--space-6) var(--space-10)',
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
          © {year} mon-aspirateur.be — {t.madeIn}
        </p>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
          {locale === 'fr'
            ? 'Aucun cookie tiers · Plausible CE · RGPD Belgique'
            : 'No third-party cookies · Plausible CE · GDPR Belgium'}
        </p>
      </div>
    </footer>
  )
}
