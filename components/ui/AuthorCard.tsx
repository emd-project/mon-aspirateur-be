import Link from 'next/link'
import type { Author } from '@/lib/data/types'

type AuthorCardProps = {
  author: Author
  variant: 'inline' | 'full'
  locale: string
}

function Monogram({ monogram, size = 64 }: { monogram: string; size?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--bg-raised)',
        border: '2px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: 'var(--font-display), Georgia, serif',
        fontSize: size * 0.38,
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
          alignItems: 'flex-start',
          gap: '1.25rem',
          padding: '1.25rem 1.5rem',
          background: 'var(--bg-surface)',
          borderRadius: '6px',
          border: '1px solid var(--border-light)',
          marginTop: '2.5rem',
        }}
      >
        <Monogram monogram={author.monogram} size={52} />
        <div>
          <Link
            href={`/${locale}/auteurs/${author.slug}`}
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              display: 'block',
              marginBottom: '.15rem',
            }}
          >
            {author.name}
          </Link>
          <p style={{ margin: '0 0 .35rem', fontSize: '.8rem', color: 'var(--accent-1)', fontWeight: 600 }}>
            {author.title}
          </p>
          <p style={{ margin: 0, fontSize: '.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
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
        padding: '1.75rem 2rem',
        background: 'var(--bg-surface)',
        borderRadius: '6px',
        border: '1px solid var(--border-light)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
        <Monogram monogram={author.monogram} size={72} />
        <div style={{ flex: 1 }}>
          <h2
            style={{
              margin: '0 0 .25rem',
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: '1.35rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            {author.name}
          </h2>
          <p style={{ margin: '0 0 .75rem', color: 'var(--accent-1)', fontWeight: 600, fontSize: '.9rem' }}>
            {author.title}
          </p>
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '.9rem' }}>
            {author.bioShort}
          </p>
        </div>
      </div>

      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
        <Link
          href={`/${locale}/auteurs/${author.slug}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '.35rem',
            color: 'var(--accent-1)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '.85rem',
          }}
        >
          {locale === 'fr' ? 'Voir le profil complet' : 'View full profile'} →
        </Link>
      </div>
    </div>
  )
}
