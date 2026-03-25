import type { ProductCategory } from './types'

export type BrandSlug =
  | 'rowenta' | 'dyson' | 'dreame' | 'roborock' | 'dji'
  | 'tineco' | 'irobot' | 'ecovacs' | 'miele' | 'bosch'
  | 'bissell' | 'samsung' | 'xiaomi'

export interface BrandProduct {
  name: string
  category: ProductCategory
  priceEur: number
  score: number        // /10
  highlight: string    // phrase courte, concret
  affiliateUrl: string // placeholder
  isTopPick?: boolean
}

export interface Brand {
  slug: BrandSlug
  name: string
  country: string
  positioning: string  // 1 phrase
  categories: ProductCategory[]
  topProducts: BrandProduct[]
}

export const brands: Brand[] = [
  {
    slug: 'rowenta',
    name: 'Rowenta',
    country: 'FR/DE',
    positioning: 'Le choix du rapport qualité/prix made in Europe, fiable et silencieux',
    categories: ['balai', 'traineau', 'laveur'],
    topProducts: [
      {
        name: 'Rowenta X-Force Flex 14.60 Animal',
        category: 'balai',
        priceEur: 399,
        score: 8.2,
        highlight: 'Brosse flexsimo qui passe sous les meubles sans se plier en quatre',
        affiliateUrl: '#',
        isTopPick: true,
      },
      {
        name: 'Rowenta Silence Force Multi-Cyclonic RO8371',
        category: 'traineau',
        priceEur: 299,
        score: 8.5,
        highlight: '68 dB — le plus silencieux de sa gamme, parfait appartement',
        affiliateUrl: '#',
        isTopPick: true,
      },
      {
        name: 'Rowenta X-Pert 3.60 Animal RH6974',
        category: 'balai',
        priceEur: 149,
        score: 7.0,
        highlight: 'Le balai entrée de gamme honnête pour une surface < 60 m²',
        affiliateUrl: '#',
      },
      {
        name: 'Rowenta Air Force 360 Aqua',
        category: 'laveur',
        priceEur: 249,
        score: 7.4,
        highlight: 'Aspire et lave en un passage, bac amovible facile à vider',
        affiliateUrl: '#',
      },
    ],
  },
  {
    slug: 'dyson',
    name: 'Dyson',
    country: 'GB',
    positioning: `L'excellence technologique — cher, mais difficile à égaler sur les tapis`,
    categories: ['balai', 'robot'],
    topProducts: [
      {
        name: 'Dyson V15 Detect Absolute',
        category: 'balai',
        priceEur: 699,
        score: 9.1,
        highlight: 'Laser qui révèle la poussière invisible — bluffant sur parquet',
        affiliateUrl: '#',
        isTopPick: true,
      },
      {
        name: 'Dyson V12 Detect Slim',
        category: 'balai',
        priceEur: 499,
        score: 8.6,
        highlight: '1,5 kg — le plus léger avec laser, idéal deux étages',
        affiliateUrl: '#',
      },
      {
        name: 'Dyson Gen5detect',
        category: 'balai',
        priceEur: 999,
        score: 9.4,
        highlight: 'Puissance maximale absolue — pour les familles avec animaux et tapis épais',
        affiliateUrl: '#',
        isTopPick: true,
      },
    ],
  },
  {
    slug: 'dreame',
    name: 'Dreame',
    country: 'CN',
    positioning: `90 % des performances Dyson à moitié prix — le challenger intelligent`,
    categories: ['balai', 'robot', 'laveur'],
    topProducts: [
      {
        name: 'Dreame T30 Neo',
        category: 'balai',
        priceEur: 399,
        score: 8.8,
        highlight: '90 min d\'autonomie, brosse anti-emmêlement — poils de chat aucun souci',
        affiliateUrl: '#',
        isTopPick: true,
      },
      {
        name: 'Dreame L20 Ultra Complete',
        category: 'robot',
        priceEur: 999,
        score: 9.2,
        highlight: 'Station autovidage + auto-lavage des serpillères — vraiment autonome',
        affiliateUrl: '#',
        isTopPick: true,
      },
      {
        name: 'Dreame H13 Pro',
        category: 'laveur',
        priceEur: 299,
        score: 8.1,
        highlight: 'Aspire et lave simultanément, sèche en 2h, zéro mauvaise odeur',
        affiliateUrl: '#',
      },
    ],
  },
  {
    slug: 'roborock',
    name: 'Roborock',
    country: 'CN',
    positioning: 'Le roi de la cartographie — navigation LiDAR la plus précise du marché',
    categories: ['robot', 'balai'],
    topProducts: [
      {
        name: 'Roborock S8 MaxV Ultra',
        category: 'robot',
        priceEur: 1199,
        score: 9.5,
        highlight: 'Camera AI + bras latéral pour les coins — la Rolls des robots aspirateurs',
        affiliateUrl: '#',
        isTopPick: true,
      },
      {
        name: 'Roborock Q Revo MaxV',
        category: 'robot',
        priceEur: 799,
        score: 8.9,
        highlight: 'Serpillère rotative qui se lève sur tapis — aucun compromis',
        affiliateUrl: '#',
        isTopPick: true,
      },
      {
        name: 'Roborock Flexi Pro',
        category: 'balai',
        priceEur: 349,
        score: 8.0,
        highlight: 'Manche flexible 360° pour sous les sofas sans se courber',
        affiliateUrl: '#',
      },
    ],
  },
  {
    slug: 'dji',
    name: 'DJI',
    country: 'CN',
    positioning: 'La précision drone appliquée à l\'aspirateur robot — pour les early adopters',
    categories: ['robot'],
    topProducts: [
      {
        name: 'DJI Robot Vacuum Omni',
        category: 'robot',
        priceEur: 799,
        score: 8.7,
        highlight: 'Station autovidage compacte, navigation DJI ultra-fluide',
        affiliateUrl: '#',
        isTopPick: true,
      },
    ],
  },
  {
    slug: 'tineco',
    name: 'Tineco',
    country: 'CN',
    positioning: 'Spécialiste du laveur de sol intelligent — capteur iLoop qui ajuste la puissance',
    categories: ['balai', 'laveur'],
    topProducts: [
      {
        name: 'Tineco Floor One S7 Pro',
        category: 'laveur',
        priceEur: 449,
        score: 9.0,
        highlight: 'Capteur iLoop + autovidage de la cuve — lave vraiment propre',
        affiliateUrl: '#',
        isTopPick: true,
      },
      {
        name: 'Tineco Pure One X Tango',
        category: 'balai',
        priceEur: 499,
        score: 8.5,
        highlight: 'Design bi-flex, deux modes tête interchangeables, 80 min autonomie',
        affiliateUrl: '#',
      },
    ],
  },
  {
    slug: 'irobot',
    name: 'iRobot',
    country: 'US',
    positioning: 'Le pionnier du robot aspirateur — fiabilité prouvée, écosystème Roomba mature',
    categories: ['robot'],
    topProducts: [
      {
        name: 'Roomba Combo j9+',
        category: 'robot',
        priceEur: 999,
        score: 8.8,
        highlight: 'Serpillère rétractable qui monte sur tapis — le meilleur combo iRobot',
        affiliateUrl: '#',
        isTopPick: true,
      },
      {
        name: 'Roomba j9+',
        category: 'robot',
        priceEur: 899,
        score: 8.6,
        highlight: 'Évite les obstacles en temps réel, vide tout seul 60 jours',
        affiliateUrl: '#',
      },
    ],
  },
  {
    slug: 'ecovacs',
    name: 'Ecovacs',
    country: 'CN',
    positioning: 'Robots polyvalents avec station tout-en-un — bon rapport autonomie/prix',
    categories: ['robot'],
    topProducts: [
      {
        name: 'Deebot X2 Omni',
        category: 'robot',
        priceEur: 999,
        score: 9.0,
        highlight: 'Design carré pour les coins, bras latéral, station 4-en-1',
        affiliateUrl: '#',
        isTopPick: true,
      },
      {
        name: 'Deebot T30 Pro Omni',
        category: 'robot',
        priceEur: 799,
        score: 8.7,
        highlight: 'Serpillère à vibration 6000 RPM — les taches séchées n\'ont qu\'à bien se tenir',
        affiliateUrl: '#',
      },
    ],
  },
  {
    slug: 'miele',
    name: 'Miele',
    country: 'DE',
    positioning: 'L\'aspirateur pour durer 20 ans — qualité allemande, silencieux, sans compromis',
    categories: ['traineau', 'balai'],
    topProducts: [
      {
        name: 'Miele Complete C3 Cat & Dog',
        category: 'traineau',
        priceEur: 499,
        score: 9.0,
        highlight: 'Filtre HEPA AirClean, 62 dB, moteur Vortex — le traîneau de référence',
        affiliateUrl: '#',
        isTopPick: true,
      },
      {
        name: 'Miele Triflex HX2 Pro',
        category: 'balai',
        priceEur: 499,
        score: 8.4,
        highlight: '3 configurations (balai/aspirateur/mini), batterie remplaçable en 1 clic',
        affiliateUrl: '#',
        isTopPick: true,
      },
    ],
  },
  {
    slug: 'bosch',
    name: 'Bosch',
    country: 'DE',
    positioning: 'Fiable, discret, bien intégré dans la maison — le choix du bon père de famille',
    categories: ['balai', 'traineau'],
    topProducts: [
      {
        name: 'Bosch Unlimited 10 BCS812',
        category: 'balai',
        priceEur: 299,
        score: 7.8,
        highlight: '60 min autonomie, écran LED, brosse All Floor — polyvalent et sobre',
        affiliateUrl: '#',
        isTopPick: true,
      },
      {
        name: 'Bosch GS50 MoveOn',
        category: 'traineau',
        priceEur: 199,
        score: 7.5,
        highlight: 'Compact, léger (3,5 kg), bon suceur à main intégré — entrée de gamme sérieuse',
        affiliateUrl: '#',
      },
    ],
  },
  {
    slug: 'bissell',
    name: 'Bissell',
    country: 'US',
    positioning: 'Spécialiste du nettoyage sol avec eau — incontournable pour les familles avec animaux',
    categories: ['laveur', 'robot'],
    topProducts: [
      {
        name: 'Bissell CrossWave X7',
        category: 'laveur',
        priceEur: 399,
        score: 8.3,
        highlight: 'Aspire et lave en même temps, brosses multi-surfaces, séchage rapide',
        affiliateUrl: '#',
        isTopPick: true,
      },
      {
        name: 'Bissell SpinWave Robot',
        category: 'robot',
        priceEur: 299,
        score: 7.2,
        highlight: 'Robot laveur abordable pour appartement sans moquette',
        affiliateUrl: '#',
      },
    ],
  },
  {
    slug: 'samsung',
    name: 'Samsung',
    country: 'KR',
    positioning: 'L\'aspirateur connecté haut de gamme — design premium, AI Cleaning Intelligence',
    categories: ['balai', 'robot'],
    topProducts: [
      {
        name: 'Samsung Bespoke Jet AI Complete',
        category: 'balai',
        priceEur: 799,
        score: 8.9,
        highlight: 'Station Clean Station vide + filtre le bac, IA qui ajuste la puissance',
        affiliateUrl: '#',
        isTopPick: true,
      },
      {
        name: 'Samsung Jet Bot AI+',
        category: 'robot',
        priceEur: 799,
        score: 8.5,
        highlight: 'Reconnaissance d\'objets par caméra, station Clean Station, mapping précis',
        affiliateUrl: '#',
      },
    ],
  },
  {
    slug: 'xiaomi',
    name: 'Xiaomi',
    country: 'CN',
    positioning: 'Le meilleur prix d\'entrée sur robots et balais — idéal pour commencer',
    categories: ['robot', 'balai'],
    topProducts: [
      {
        name: 'Xiaomi Robot Vacuum X10+',
        category: 'robot',
        priceEur: 499,
        score: 8.2,
        highlight: 'LiDAR + station autovidage sous les 500€ — difficile à battre',
        affiliateUrl: '#',
        isTopPick: true,
      },
      {
        name: 'Xiaomi Vacuum Cleaner G10 Plus',
        category: 'balai',
        priceEur: 199,
        score: 7.3,
        highlight: '120 000 Pa, 60 min, filtre HEPA — honnête et sans chichi',
        affiliateUrl: '#',
      },
    ],
  },
]

export function getBrand(slug: BrandSlug): Brand | undefined {
  return brands.find(b => b.slug === slug)
}

export function getBrandsByCategory(category: ProductCategory): Brand[] {
  return brands.filter(b => b.categories.includes(category))
}

export type BrandProductWithBrand = BrandProduct & { brandName: string }

export function getTopPicksByCategory(category: ProductCategory): BrandProductWithBrand[] {
  return brands
    .flatMap(b =>
      b.topProducts
        .filter(p => p.category === category && p.isTopPick)
        .map(p => ({ ...p, brandName: b.name }))
    )
    .sort((a, b) => b.score - a.score)
}
