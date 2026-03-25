import type { Product } from '../types'

export const PRODUCTS: Product[] = [
  {
    slug: 'robot-a-lidar-349',
    name: 'RoboVac LiDAR Pro',
    brand: 'EcoVacs',
    type: 'robot',
    score: 91,
    priceEur: 349,
    surfaceM2Max: 120,
    noiseDb: 62,
    autonomyMin: 110,
    hepaFilter: true,
    petFriendly: false,
    excerpt: `Navigation LiDAR précise, idéal pour appartements jusqu'à 120 m² sur parquet.`,
    locale: 'fr',
  },
  {
    slug: 'robot-b-pet-449',
    name: 'RoboVac PetCare Max',
    brand: 'EcoVacs',
    type: 'robot',
    score: 87,
    priceEur: 449,
    surfaceM2Max: 150,
    noiseDb: 64,
    autonomyMin: 120,
    hepaFilter: true,
    petFriendly: true,
    excerpt: 'Brosse anti-emmêlement pour foyers avec animaux, autonomie 120 min.',
    locale: 'fr',
  },
  {
    slug: 'dyson-v15-detect',
    name: 'Dyson V15 Detect',
    brand: 'Dyson',
    type: 'balai',
    score: 88,
    priceEur: 599,
    surfaceM2Max: 200,
    noiseDb: 78,
    autonomyMin: 60,
    hepaFilter: true,
    petFriendly: true,
    excerpt: 'Détecteur de particules laser, adapté aux foyers avec animaux.',
    locale: 'fr',
  },
  {
    slug: 'miele-triflex-hx2',
    name: 'Miele Triflex HX2',
    brand: 'Miele',
    type: 'sans-fil',
    score: 85,
    priceEur: 549,
    surfaceM2Max: 180,
    noiseDb: 72,
    autonomyMin: 120,
    hepaFilter: true,
    petFriendly: false,
    excerpt: 'Durabilité 10 ans, filtration HEPA testée, SAV belge excellent.',
    locale: 'fr',
  },
]

export const getProduct = (slug: string): Product | undefined =>
  PRODUCTS.find((p) => p.slug === slug)

export const getProducts = (locale: string): Product[] =>
  PRODUCTS.filter((p) => p.locale === locale)

export const filterProducts = (params: {
  locale: string
  type?: Product['type']
  maxPrice?: number
  minAutonomy?: number
  petFriendly?: boolean
  hepaFilter?: boolean
  minSurface?: number
}): Product[] => {
  return PRODUCTS.filter((p) => {
    if (p.locale !== params.locale) return false
    if (params.type && p.type !== params.type) return false
    if (params.maxPrice !== undefined && p.priceEur > params.maxPrice) return false
    if (params.minAutonomy !== undefined && p.autonomyMin < params.minAutonomy) return false
    if (params.petFriendly && !p.petFriendly) return false
    if (params.hepaFilter && !p.hepaFilter) return false
    if (params.minSurface !== undefined && p.surfaceM2Max < params.minSurface) return false
    return true
  })
}
