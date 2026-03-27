// ArticleImage — Image éditoriale dans un article
// Placé dans le MDX avec: <ArticleImage src="https://..." alt="..." caption="..." />
// Si src est absent ou vide, le composant ne rend rien.

type Props = {
  src?: string
  alt?: string
  caption?: string
}

export default function ArticleImage({ src, alt, caption }: Props) {
  if (!src) return null

  return (
    <figure style={{
      margin: '2rem 0',
      padding: 0,
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt ?? ''}
        style={{
          width: '100%',
          height: 'auto',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
          display: 'block',
        }}
        loading="lazy"
        decoding="async"
      />
      {caption && (
        <figcaption style={{
          marginTop: '.5rem',
          fontSize: '.8rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
          fontStyle: 'italic',
          lineHeight: 1.5,
        }}>
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
