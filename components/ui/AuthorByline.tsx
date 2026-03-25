import Link from 'next/link'

type AuthorBylineProps = {
  authorSlug: string
  authorName: string
  publishedAt: string   // ISO 8601
  updatedAt?: string
  readingTimeMin?: number
  locale: string
}

const formatDate = (iso: string, locale: string): string => {
  const date = new Date(iso)
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-BE' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export default function AuthorByline({
  authorSlug,
  authorName,
  publishedAt,
  updatedAt,
  readingTimeMin,
  locale,
}: AuthorBylineProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        flexWrap: 'wrap',
        fontSize: '14px',
        color: 'var(--text-muted)',
      }}
    >
      <span>
        {locale === 'fr' ? 'Par' : 'By'}{' '}
        <Link
          href={`/${locale}/auteurs/${authorSlug}`}
          style={{ color: 'var(--accent-1)', fontWeight: 600, textDecoration: 'none' }}
        >
          {authorName}
        </Link>
      </span>

      <span aria-hidden="true">·</span>

      <time dateTime={publishedAt}>
        {locale === 'fr' ? 'Publié le' : 'Published'}{' '}
        {formatDate(publishedAt, locale)}
      </time>

      {updatedAt && updatedAt !== publishedAt && (
        <>
          <span aria-hidden="true">·</span>
          <time dateTime={updatedAt}>
            {locale === 'fr' ? 'Mis à jour le' : 'Updated'}{' '}
            {formatDate(updatedAt, locale)}
          </time>
        </>
      )}

      {readingTimeMin !== undefined && (
        <>
          <span aria-hidden="true">·</span>
          <span>{readingTimeMin} min</span>
        </>
      )}
    </div>
  )
}
