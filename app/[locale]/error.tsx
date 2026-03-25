'use client'

import Link from 'next/link'

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ reset }: ErrorProps) {
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
      <p
        aria-hidden="true"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(60px, 15vw, 140px)',
          fontWeight: 900,
          lineHeight: 1,
          color: 'var(--bg-surface-2)',
          margin: '0 0 var(--space-8)',
          userSelect: 'none',
        }}
      >
        500
      </p>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(22px, 3vw, 36px)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 var(--space-4)',
        }}
      >
        Une erreur est survenue
      </h1>

      <p
        style={{
          fontSize: '17px',
          color: 'var(--text-secondary)',
          margin: '0 0 var(--space-8)',
          maxWidth: 420,
          lineHeight: 1.75,
        }}
      >
        Quelque chose s&apos;est mal passé. Veuillez réessayer.
      </p>

      <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: 'var(--space-3) var(--space-8)',
            background: 'var(--accent-1)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            fontWeight: 700,
            fontSize: '15px',
            cursor: 'pointer',
          }}
        >
          Réessayer
        </button>
        <Link
          href="/fr"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: 'var(--space-3) var(--space-8)',
            background: 'transparent',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '15px',
          }}
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  )
}
