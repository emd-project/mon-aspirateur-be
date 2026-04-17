export interface FieldGroup {
  title: string
  keys: string[]
  column: 'main' | 'side'
  accent?: string
  defaultOpen?: boolean
}

const ARTICLE_GROUPS: FieldGroup[] = [
  { title: 'Contenu', keys: ['title'], column: 'main', defaultOpen: true },
  { title: 'SEO & Catégorie', keys: ['excerpt', 'category', 'categorySlug', 'readingTimeMin'], column: 'side', accent: '#2B7A5F' },
  { title: 'Publication', keys: ['draft', 'publishedAt', 'updatedAt', 'authorSlug', 'locale'], column: 'side', accent: '#6B5E54' },
]

const PRODUCT_GROUPS: FieldGroup[] = [
  { title: 'Informations', keys: ['name', 'brand', 'type', 'description'], column: 'main', defaultOpen: true },
  { title: 'Spécifications', keys: ['price', 'rating', 'weight', 'dimensions', 'noiseLevelDb', 'suctionPower', 'batteryMinutes'], column: 'main', accent: '#2B7A5F' },
  { title: 'Évaluation', keys: ['pros', 'cons'], column: 'main', accent: '#6B5E54' },
  { title: 'Commerce', keys: ['affiliateUrl'], column: 'side', accent: '#C49A2D' },
]

const PAGE_GROUPS: FieldGroup[] = [
  { title: 'Hero', keys: ['hero_headline', 'hero_subheadline', 'hero_cta', 'hero_cta_secondary'], column: 'main', defaultOpen: true },
  { title: 'Contenu', keys: ['page_title', 'page_subtitle', 'section_label'], column: 'main' },
  { title: 'SEO', keys: ['meta_title', 'meta_description'], column: 'side', accent: '#2B7A5F' },
]

export function getGroups(collection: string): FieldGroup[] {
  if (collection === 'articles') return ARTICLE_GROUPS
  if (collection === 'products') return PRODUCT_GROUPS
  if (collection === 'pages') return PAGE_GROUPS
  return []
}

export const IMAGE_SETS = [
  { n: 1, image: 'image1', alt: 'image1Alt', caption: 'image1Caption' },
  { n: 2, image: 'image2', alt: 'image2Alt', caption: 'image2Caption' },
  { n: 3, image: 'image3', alt: 'image3Alt', caption: 'image3Caption' },
]

export const IMAGE_KEYS = new Set(IMAGE_SETS.flatMap((s) => [s.image, s.alt, s.caption]))
