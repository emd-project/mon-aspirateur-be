import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

type FooterProps = {
  locale: string
}

export default async function Footer({ locale }: FooterProps) {
  const t    = await getTranslations({ locale, namespace: 'footer' })
  const base = `/${locale}`

  const categories = [
    { slug: 'balai',       label: 'Aspirateurs balai' },
    { slug: 'robot',       label: 'Robots aspirateurs' },
    { slug: 'traineau',    label: 'Aspirateurs traîneau' },
    { slug: 'laveur',      label: 'Laveurs de sol' },
    { slug: 'accessoires', label: 'Accessoires' },
  ]

  return (
    <footer
      style={{
        background: 'var(--bg-raised)',
        borderTop: '1px solid var(--border-light)',
        paddingTop: '3rem',
        paddingBottom: '2rem',
        marginTop: '4rem',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '2rem',
          paddingBottom: '2.5rem',
          borderBottom: '1px solid var(--border-light)',
        }}>

          {/* Brand */}
          <div>
            <div style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: '1.3rem',
              fontWeight: 900,
              letterSpacing: '-.02em',
              color: 'var(--text-primary)',
              marginBottom: '.75rem',
            }}>
              Mon<span style={{ color: 'var(--accent-1)' }}>Aspirateur</span>
            </div>
            <p style={{ fontSize: '.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '220px' }}>
              {t('tagline')}
            </p>
            <p style={{ marginTop: '1rem', fontSize: '.75rem', color: 'var(--text-muted)' }}>
              {t('authorLink')}
            </p>
          </div>

          {/* Comparer */}
          <div>
            <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '.75rem' }}>
              Comparer
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
              {categories.map(cat => (
                <li key={cat.slug}>
                  <Link href={`${base}/comparer/${cat.slug}`} style={{ fontSize: '.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Guides */}
          <div>
            <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '.75rem' }}>
              Guides
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
              {categories.slice(0, 4).map(cat => (
                <li key={cat.slug}>
                  <Link href={`${base}/choisir/${cat.slug}`} style={{ fontSize: '.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                    Choisir : {cat.label.toLowerCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Liens */}
          <div>
            <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '.75rem' }}>
              {t('about')}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
              {[
                { href: `${base}/quiz`,             label: 'Quiz aspirateur' },
                { href: `${base}/deals`,            label: 'Deals & Promos' },
                { href: `${base}/marques`,          label: 'Toutes les marques' },
                { href: `${base}/blog`,             label: 'Blog' },
                { href: `${base}/auteurs/thomas-v`, label: "L'auteur" },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} style={{ fontSize: '.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', maxWidth: '480px', lineHeight: 1.6, margin: 0 }}>
            {t('affDisclaimer')}
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { href: `${base}/mentions-legales`, label: t('legal') },
              { href: `${base}/confidentialite`,  label: t('privacy') },
              { href: `${base}/cookies`,          label: t('cookies') },
            ].map(link => (
              <Link key={link.href} href={link.href} style={{ fontSize: '.75rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  )
}
