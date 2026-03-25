import Link from 'next/link'
import type { Author } from '@/lib/data/types'

type AuthorCardProps = {
  author: Author
  variant: 'inline' | 'full'
  locale: string
}

// Monogramme CSS TV — Playfair 900, --accent-1
function Monogram({ monogram, size = 64 }: { monogram: string; size?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: 'var(--radius-full)',
        background: 'var(--bg-surface-2)',
        border: '2px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: 'var(--font-display)',
        fontSize: size * 0.4,
        fontWeight: 900,
        color: 'var(--accent-1)',
        letterSpacing: '-0.02em',
      }}
    >
      {monogram}
    </div>
  )
}

export default function AuthorCard({ author, variant, locale }: AuthorCardProps) {
  if (variant === 'inline') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          padding: 'var(--space-6)',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
        }}
      >
        <Monogram monogram={author.monogram} size={56} />
        <div>
          <Link
            href={`/${locale}/auteurs/${author.slug}`}
            style={{
              fontWeight: 700,
              color: 'var(--text-primary)',
              textDecoration: 'none',
              display: 'block',
            }}
          >
            {author.name}
          </Link>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
            {author.title}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
            {author.bioShort}
          </p>
        </div>
      </div>
    )
  }

  // full variant
  return (
    <div
      style={{
        padding: 'var(--space-8)',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-6)' }}>
        <Monogram monogram={author.monogram} size={80} />
        <div style={{ flex: 1 }}>
          <h2
            style={{
              margin: '0 0 var(--space-1)',
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            {author.name}
          </h2>
          <p style={{ margin: '0 0 var(--space-4)', color: 'var(--accent-1)', fontWeight: 600 }}>
            {author.title}
          </p>
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.75 }}>
            {author.bioShort}
          </p>
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-4)' }}>
        <Link
          href={`/${locale}/auteurs/${author.slug}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            color: 'var(--accent-1)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          {locale === 'fr' ? 'Voir le profil complet' : 'View full profile'} →
        </Link>
      </div>
    </div>
  )
}
