import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function NotFound() {
  // Locale not available in not-found, default to fr
  const t = await getTranslations({ locale: 'fr', namespace: 'errors.notFound' })

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        padding: 'var(--space-10)',
        textAlign: 'center',
      }}
    >
      {/* Typo XXL — DA 404 */}
      <p
        aria-hidden="true"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(80px, 20vw, 200px)',
          fontWeight: 900,
          lineHeight: 1,
          color: 'var(--bg-surface-2)',
          margin: '0 0 var(--space-8)',
          userSelect: 'none',
        }}
      >
        404
      </p>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(24px, 4vw, 40px)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 var(--space-4)',
        }}
      >
        {t('title')}
      </h1>

      <p
        style={{
          fontSize: '17px',
          color: 'var(--text-secondary)',
          margin: '0 0 var(--space-8)',
          maxWidth: 440,
          lineHeight: 1.75,
        }}
      >
        {t('message')}
      </p>

      <Link
        href="/fr"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-3) var(--space-8)',
          background: 'var(--accent-1)',
          color: '#fff',
          borderRadius: 'var(--radius-full)',
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: '15px',
          transition: 'transform 0.15s var(--ease-out), box-shadow 0.15s var(--ease-out)',
        }}
      >
        {t('cta')}
      </Link>
    </div>
  )
}
