import Link from 'next/link'

type AuthorBylineProps = {
  authorSlug: string
  authorName: string
  publishedAt?: string   // ISO 8601 — optionnel : un article importé peut ne pas l'avoir
  updatedAt?: string
  readingTimeMin?: number
  locale: string
}

const formatDate = (iso: string | undefined, locale: string): string | null => {
  if (!iso) return null
  const date = new Date(iso)
  if (isNaN(date.getTime())) return null
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
  const publishedLabel = formatDate(publishedAt, locale)
  const updatedLabel = updatedAt && updatedAt !== publishedAt ? formatDate(updatedAt, locale) : null

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

      {publishedLabel && (
        <>
          <span aria-hidden="true">·</span>
          <time dateTime={publishedAt}>
            {locale === 'fr' ? 'Publié le' : 'Published'} {publishedLabel}
          </time>
        </>
      )}

      {updatedLabel && (
        <>
          <span aria-hidden="true">·</span>
          <time dateTime={updatedAt}>
            {locale === 'fr' ? 'Mis à jour le' : 'Updated'} {updatedLabel}
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
