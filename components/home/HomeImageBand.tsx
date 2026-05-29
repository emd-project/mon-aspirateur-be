// HomeImageBand — bande éditoriale d'images sur la page d'accueil (1 à 3).
// Rend le site plus vivant et humain. Composant serveur, images gérées via le CMS
// (content/pages/accueil.mdx → image1..3). Ne rend rien si aucune image n'est définie.
//
// Choix techniques :
// - <img> natif (cohérent avec ArticleImage, pas de next/image dans ce projet ;
//   la CSP autorise `img-src 'self' data: https:`).
// - Hauteur de bande fixe via clamp + object-fit:cover → strip homogène quel que
//   soit le nombre d'images, sans décalage de mise en page (la 1re image est
//   prioritaire pour le LCP, les suivantes en lazy).
// - Grille auto-fit → responsive sans media query (empile sur mobile).

import type { HomeImage } from '@/lib/content/home-images'

type Props = {
  images: HomeImage[]
  locale: string
}

export default function HomeImageBand({ images, locale }: Props) {
  if (!images.length) return null

  // Libellés en dur FR/EN, cohérent avec le reste de la home.
  const eyebrow = locale === 'fr' ? 'Le terrain' : 'On the ground'
  const heading =
    locale === 'fr' ? 'Testé à la maison, pas en labo.' : 'Tested at home, not in a lab.'

  // Une seule image → bande haute façon hero ; plusieurs → strip plus compact.
  const tileHeight =
    images.length === 1 ? 'clamp(300px, 46vw, 560px)' : 'clamp(220px, 30vw, 380px)'

  return (
    <section
      aria-label={eyebrow}
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-light)',
        borderBottom: '1px solid var(--border-light)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(3rem, 6vw, 4.5rem) 1.5rem' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <p
            style={{
              fontSize: '.72rem',
              fontWeight: 700,
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: 'var(--accent-1)',
              margin: '0 0 .35rem',
            }}
          >
            {eyebrow}
          </p>
          <h2
            className="typo-h2"
            style={{
              margin: 0,
              fontFamily: 'var(--font-playfair), Georgia, serif',
            }}
          >
            {heading}
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: '1rem',
          }}
        >
          {images.map((img, i) => (
            <figure key={img.src} style={{ margin: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt}
                width={1200}
                height={900}
                style={{
                  display: 'block',
                  width: '100%',
                  height: tileHeight,
                  objectFit: 'cover',
                  objectPosition: 'center 35%',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                }}
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : 'auto'}
                decoding="async"
              />
              {img.caption && (
                <figcaption
                  style={{
                    marginTop: '.5rem',
                    fontSize: '.8rem',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                    lineHeight: 1.5,
                  }}
                >
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
