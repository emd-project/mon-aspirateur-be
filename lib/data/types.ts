// Data types — agnostic layer (mock V1 → Sanity V2)
// Components consume these types, never Sanity directly.

export type Locale = 'fr' | 'en'

export type ProductCategory = 'balai' | 'robot' | 'traineau' | 'laveur' | 'accessoires'

export type Author = {
  slug: string
  name: string
  title: string
  bioShort: string
  bioLong: string
  monogram: string // e.g. "TV"
  linkedIn?: string
  publishedArticles: number
  knowsAbout: string[]
}

export type Article = {
  slug: string
  title: string
  excerpt: string
  category: string
  categorySlug: string
  publishedAt: string // ISO 8601
  updatedAt?: string
  readingTimeMin: number
  authorSlug: string
  locale: Locale
  body: string
  faq?: FaqItem[]
  relatedSlugs?: string[]
}

export type Guide = {
  slug: string
  title: string
  excerpt: string
  publishedAt: string
  updatedAt?: string
  readingTimeMin: number
  authorSlug: string
  locale: Locale
  body: string
  faq?: FaqItem[]
}

export type Comparatif = {
  slug: string
  title: string
  brandA: string
  brandB: string
  excerpt: string
  publishedAt: string
  updatedAt?: string
  readingTimeMin: number
  authorSlug: string
  locale: Locale
  body: string
  verdict: string
}

export type Product = {
  slug: string
  name: string
  brand: string
  category: ProductCategory
  score: number
  priceEur: number
  surfaceM2Max: number
  noiseDb: number
  autonomyMin: number
  hepaFilter: boolean
  petFriendly: boolean
  excerpt: string
  locale: Locale
}

export type FaqItem = {
  question: string
  answer: string
}

export type LegalPage = {
  slug: string
  title: string
  body: string
  locale: Locale
}
