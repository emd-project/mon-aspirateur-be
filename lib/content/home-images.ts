import type { PageContent } from './pages'

// Image éditoriale de la page d'accueil — jusqu'à 3, gérées via le CMS
// (collection "pages", fichier content/pages/accueil.mdx).
export type HomeImage = { src: string; alt: string; caption?: string }

/**
 * Extrait les images de la home depuis le frontmatter de la page.
 * - Ne garde que les slots dont `src` est une chaîne non vide.
 * - Conserve l'ordre 1 → 3 et plafonne à 3.
 * - `alt` par défaut vide, `caption` optionnelle (undefined si vide).
 *
 * Robuste aux frontmatters partiels : un slot vide est simplement ignoré,
 * donc la bande d'images ne s'affiche que s'il y a au moins une image.
 */
export function getHomeImages(page: PageContent): HomeImage[] {
  const slots: { src?: string; alt?: string; caption?: string }[] = [
    { src: page.image1, alt: page.image1Alt, caption: page.image1Caption },
    { src: page.image2, alt: page.image2Alt, caption: page.image2Caption },
    { src: page.image3, alt: page.image3Alt, caption: page.image3Caption },
  ]

  return slots
    .filter((s): s is { src: string; alt?: string; caption?: string } =>
      typeof s.src === 'string' && s.src.trim() !== '',
    )
    .slice(0, 3)
    .map((s) => {
      const caption = s.caption?.trim()
      return {
        src: s.src.trim(),
        alt: (s.alt ?? '').trim(),
        ...(caption ? { caption } : {}),
      }
    })
}
