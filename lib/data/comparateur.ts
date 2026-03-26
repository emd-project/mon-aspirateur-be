import type { ProductCategory } from './types'

/* ─── Specs par catégorie ───────────────────────────────────── */

export interface SpecDef {
  key: string
  label: string
  labelEn: string
  unit?: string
  description?: string
  higherIsBetter: boolean
}

export interface ProductSpec {
  productId: string
  brandSlug: string
  modelName: string
  category: ProductCategory
  priceEur: number
  score: number
  affiliateUrl: string
  specs: Record<string, string | number | boolean>
}

/* ─── Définitions des specs par catégorie ───────────────────── */

export const specsByCategory: Record<ProductCategory, SpecDef[]> = {
  balai: [
    { key: 'puissance',   label: 'Puissance',       labelEn: 'Suction power',  unit: 'W',   higherIsBetter: true },
    { key: 'autonomie',   label: 'Autonomie max',    labelEn: 'Max battery',    unit: 'min', higherIsBetter: true },
    { key: 'charge',      label: 'Charge',           labelEn: 'Charge time',    unit: 'h',   higherIsBetter: false },
    { key: 'poids',       label: 'Poids',            labelEn: 'Weight',         unit: 'kg',  higherIsBetter: false },
    { key: 'bac',         label: 'Capacité bac',     labelEn: 'Bin capacity',   unit: 'L',   higherIsBetter: true },
    { key: 'bruit',       label: 'Bruit',            labelEn: 'Noise',          unit: 'dB',  higherIsBetter: false },
    { key: 'hepa',        label: 'Filtre HEPA',      labelEn: 'HEPA filter',                 higherIsBetter: true },
    { key: 'prix',        label: 'Prix indicatif',   labelEn: 'Price',          unit: '€',   higherIsBetter: false },
  ],
  robot: [
    { key: 'navigation',  label: 'Navigation',       labelEn: 'Navigation',                  higherIsBetter: true, description: 'LiDAR / Caméra / Gyroscope' },
    { key: 'puissance',   label: 'Aspiration',       labelEn: 'Suction',        unit: 'Pa',  higherIsBetter: true },
    { key: 'autonomie',   label: 'Autonomie',        labelEn: 'Battery',        unit: 'min', higherIsBetter: true },
    { key: 'autovidage',  label: 'Auto-vidage',      labelEn: 'Auto-empty',                  higherIsBetter: true },
    { key: 'lavage',      label: 'Lavage sol',       labelEn: 'Mopping',                     higherIsBetter: true },
    { key: 'cartographie',label: 'Cartographie',     labelEn: 'Mapping',                     higherIsBetter: true, description: 'Multi-étages / Zones interdites' },
    { key: 'bruit',       label: 'Bruit',            labelEn: 'Noise',          unit: 'dB',  higherIsBetter: false },
    { key: 'prix',        label: 'Prix indicatif',   labelEn: 'Price',          unit: '€',   higherIsBetter: false },
  ],
  traineau: [
    { key: 'puissance',   label: 'Puissance',        labelEn: 'Power',          unit: 'W',   higherIsBetter: true },
    { key: 'rayon',       label: 'Rayon action',     labelEn: 'Cord length',    unit: 'm',   higherIsBetter: true },
    { key: 'capacite',    label: 'Capacité',         labelEn: 'Bin capacity',   unit: 'L',   higherIsBetter: true },
    { key: 'bruit',       label: 'Bruit',            labelEn: 'Noise',          unit: 'dB',  higherIsBetter: false },
    { key: 'energie',     label: 'Classe énergie',   labelEn: 'Energy class',                higherIsBetter: true },
    { key: 'poids',       label: 'Poids',            labelEn: 'Weight',         unit: 'kg',  higherIsBetter: false },
    { key: 'hepa',        label: 'Filtre HEPA',      labelEn: 'HEPA filter',                 higherIsBetter: true },
    { key: 'prix',        label: 'Prix indicatif',   labelEn: 'Price',          unit: '€',   higherIsBetter: false },
  ],
  laveur: [
    { key: 'combi',       label: 'Aspire + lave',    labelEn: 'Vacuum + mop',                higherIsBetter: true },
    { key: 'autonomie',   label: 'Autonomie',        labelEn: 'Battery',        unit: 'min', higherIsBetter: true },
    { key: 'autovidage',  label: 'Auto-vidage',      labelEn: 'Auto-empty',                  higherIsBetter: true },
    { key: 'sechage',     label: 'Séchage auto',     labelEn: 'Auto-dry',                    higherIsBetter: true },
    { key: 'sols',        label: 'Types de sols',    labelEn: 'Floor types',                 higherIsBetter: true },
    { key: 'poids',       label: 'Poids',            labelEn: 'Weight',         unit: 'kg',  higherIsBetter: false },
    { key: 'prix',        label: 'Prix indicatif',   labelEn: 'Price',          unit: '€',   higherIsBetter: false },
  ],
  accessoires: [
    { key: 'compatibilite',label: 'Compatibilité',   labelEn: 'Compatibility',               higherIsBetter: true },
    { key: 'type',         label: 'Type',            labelEn: 'Type',                        higherIsBetter: true },
    { key: 'prix',         label: 'Prix indicatif',  labelEn: 'Price',          unit: '€',   higherIsBetter: false },
  ],
}

/* ─── Produits comparateur ───────────────────────────────────── */

export const comparateurProducts: ProductSpec[] = [
  // ── BALAIS ──────────────────────────────────────────────────
  {
    productId: 'rowenta-xforce-1460',
    brandSlug: 'rowenta',
    modelName: 'Rowenta X-Force Flex 14.60 Animal',
    category: 'balai',
    priceEur: 399,
    score: 8.5,
    affiliateUrl: '#',
    specs: {
      puissance: 530, autonomie: 65, charge: 3.5,
      poids: 3.1, bac: 0.9, bruit: 74, hepa: true, prix: 399,
    },
  },
  {
    productId: 'dyson-v15-detect',
    brandSlug: 'dyson',
    modelName: 'Dyson V15 Detect Absolute',
    category: 'balai',
    priceEur: 699,
    score: 9.1,
    affiliateUrl: '#',
    specs: {
      puissance: 240, autonomie: 60, charge: 4.5,
      poids: 3.1, bac: 0.76, bruit: 79, hepa: true, prix: 699,
    },
  },
  {
    productId: 'dreame-t30-neo',
    brandSlug: 'dreame',
    modelName: 'Dreame T30 Neo',
    category: 'balai',
    priceEur: 399,
    score: 8.8,
    affiliateUrl: '#',
    specs: {
      puissance: 210, autonomie: 90, charge: 3,
      poids: 3.1, bac: 0.8, bruit: 76, hepa: true, prix: 399,
    },
  },
  {
    productId: 'samsung-bespoke-jet-ai',
    brandSlug: 'samsung',
    modelName: 'Samsung Bespoke Jet AI Complete',
    category: 'balai',
    priceEur: 799,
    score: 8.9,
    affiliateUrl: '#',
    specs: {
      puissance: 280, autonomie: 60, charge: 3.5,
      poids: 3.0, bac: 0.6, bruit: 77, hepa: true, prix: 799,
    },
  },
  {
    productId: 'miele-triflex-hx2',
    brandSlug: 'miele',
    modelName: 'Miele Triflex HX2 Pro',
    category: 'balai',
    priceEur: 499,
    score: 8.4,
    affiliateUrl: '#',
    specs: {
      puissance: 185, autonomie: 60, charge: 4,
      poids: 3.5, bac: 0.77, bruit: 69, hepa: true, prix: 499,
    },
  },
  {
    productId: 'bosch-unlimited-10',
    brandSlug: 'bosch',
    modelName: 'Bosch Unlimited 10 BCS812',
    category: 'balai',
    priceEur: 299,
    score: 7.8,
    affiliateUrl: '#',
    specs: {
      puissance: 180, autonomie: 60, charge: 5,
      poids: 3.2, bac: 0.9, bruit: 78, hepa: false, prix: 299,
    },
  },

  // ── ROBOTS ──────────────────────────────────────────────────
  {
    productId: 'roborock-s8-maxv-ultra',
    brandSlug: 'roborock',
    modelName: 'Roborock S8 MaxV Ultra',
    category: 'robot',
    priceEur: 1199,
    score: 9.5,
    affiliateUrl: '#',
    specs: {
      navigation: 'LiDAR + Caméra', puissance: 10000, autonomie: 180,
      autovidage: true, lavage: true, cartographie: 'Multi-étages + zones interdites',
      bruit: 67, prix: 1199,
    },
  },
  {
    productId: 'dreame-l20-ultra',
    brandSlug: 'dreame',
    modelName: 'Dreame L20 Ultra Complete',
    category: 'robot',
    priceEur: 999,
    score: 9.2,
    affiliateUrl: '#',
    specs: {
      navigation: 'LiDAR', puissance: 7000, autonomie: 210,
      autovidage: true, lavage: true, cartographie: 'Multi-étages + zones interdites',
      bruit: 65, prix: 999,
    },
  },
  {
    productId: 'roborock-q-revo-maxv',
    brandSlug: 'roborock',
    modelName: 'Roborock Q Revo MaxV',
    category: 'robot',
    priceEur: 799,
    score: 8.9,
    affiliateUrl: '#',
    specs: {
      navigation: 'LiDAR', puissance: 5500, autonomie: 180,
      autovidage: true, lavage: true, cartographie: 'Multi-étages',
      bruit: 66, prix: 799,
    },
  },
  {
    productId: 'ecovacs-deebot-x2-omni',
    brandSlug: 'ecovacs',
    modelName: 'Deebot X2 Omni',
    category: 'robot',
    priceEur: 999,
    score: 9.0,
    affiliateUrl: '#',
    specs: {
      navigation: 'LiDAR + Caméra', puissance: 8000, autonomie: 200,
      autovidage: true, lavage: true, cartographie: 'Multi-étages',
      bruit: 68, prix: 999,
    },
  },
  {
    productId: 'xiaomi-x10-plus',
    brandSlug: 'xiaomi',
    modelName: 'Xiaomi Robot Vacuum X10+',
    category: 'robot',
    priceEur: 499,
    score: 8.2,
    affiliateUrl: '#',
    specs: {
      navigation: 'LiDAR', puissance: 4000, autonomie: 150,
      autovidage: true, lavage: true, cartographie: 'Multi-étages',
      bruit: 68, prix: 499,
    },
  },
  {
    productId: 'irobot-combo-j9-plus',
    brandSlug: 'irobot',
    modelName: 'Roomba Combo j9+',
    category: 'robot',
    priceEur: 999,
    score: 8.8,
    affiliateUrl: '#',
    specs: {
      navigation: 'Caméra', puissance: 3300, autonomie: 90,
      autovidage: true, lavage: true, cartographie: 'Multi-étages',
      bruit: 63, prix: 999,
    },
  },

  // ── TRAÎNEAUX ───────────────────────────────────────────────
  {
    productId: 'miele-complete-c3',
    brandSlug: 'miele',
    modelName: 'Miele Complete C3 Cat & Dog',
    category: 'traineau',
    priceEur: 499,
    score: 9.0,
    affiliateUrl: '#',
    specs: {
      puissance: 890, rayon: 12, capacite: 4.5,
      bruit: 62, energie: 'A', poids: 9.5, hepa: true, prix: 499,
    },
  },
  {
    productId: 'rowenta-silence-force-ro8371',
    brandSlug: 'rowenta',
    modelName: 'Rowenta Silence Force Multi-Cyclonic RO8371',
    category: 'traineau',
    priceEur: 299,
    score: 8.7,
    affiliateUrl: '#',
    specs: {
      puissance: 750, rayon: 10, capacite: 3.5,
      bruit: 65, energie: 'A', poids: 8.2, hepa: true, prix: 299,
    },
  },
  {
    productId: 'bosch-gs50',
    brandSlug: 'bosch',
    modelName: 'Bosch GS50 MoveOn',
    category: 'traineau',
    priceEur: 199,
    score: 7.5,
    affiliateUrl: '#',
    specs: {
      puissance: 600, rayon: 9, capacite: 3.0,
      bruit: 73, energie: 'C', poids: 7.8, hepa: false, prix: 199,
    },
  },

  // ── LAVEURS ──────────────────────────────────────────────────
  {
    productId: 'tineco-floor-s7-pro',
    brandSlug: 'tineco',
    modelName: 'Tineco Floor One S7 Pro',
    category: 'laveur',
    priceEur: 449,
    score: 9.0,
    affiliateUrl: '#',
    specs: {
      combi: true, autonomie: 35, autovidage: true,
      sechage: true, sols: 'Carrelage, vinyle, stratifié', poids: 5.5, prix: 449,
    },
  },
  {
    productId: 'bissell-crosswave-x7',
    brandSlug: 'bissell',
    modelName: 'Bissell CrossWave X7',
    category: 'laveur',
    priceEur: 399,
    score: 8.3,
    affiliateUrl: '#',
    specs: {
      combi: true, autonomie: 30, autovidage: false,
      sechage: false, sols: 'Carrelage, vinyle, moquette fine', poids: 5.2, prix: 399,
    },
  },
  {
    productId: 'rowenta-air-force-360-aqua',
    brandSlug: 'rowenta',
    modelName: 'Rowenta Air Force 360 Aqua',
    category: 'laveur',
    priceEur: 249,
    score: 7.7,
    affiliateUrl: '#',
    specs: {
      combi: true, autonomie: 28, autovidage: false,
      sechage: false, sols: 'Carrelage, vinyle, parquet', poids: 4.8, prix: 249,
    },
  },
  {
    productId: 'dreame-h13-pro',
    brandSlug: 'dreame',
    modelName: 'Dreame H13 Pro',
    category: 'laveur',
    priceEur: 299,
    score: 8.1,
    affiliateUrl: '#',
    specs: {
      combi: true, autonomie: 40, autovidage: false,
      sechage: true, sols: 'Carrelage, vinyle, parquet, stratifié', poids: 5.1, prix: 299,
    },
  },
]

/* ─── Helpers ───────────────────────────────────────────────── */

export function getProductsByCategory(category: ProductCategory): ProductSpec[] {
  return comparateurProducts.filter(p => p.category === category)
    .sort((a, b) => b.score - a.score)
}

export function getProductById(id: string): ProductSpec | undefined {
  return comparateurProducts.find(p => p.productId === id)
}

export function getProductsByBrand(brandSlug: string): ProductSpec[] {
  return comparateurProducts.filter(p => p.brandSlug === brandSlug)
}

/* ─── Labels catégorie ──────────────────────────────────────── */

export const categoryMeta: Record<ProductCategory, {
  label: string
  labelEn: string
  color: string
  icon: string
  description: string
}> = {
  balai: {
    label: 'Aspirateurs balai',
    labelEn: 'Cordless stick vacuums',
    color: 'var(--color-balai)',
    icon: '🧹',
    description: 'Sans fil, légers, idéaux pour un usage quotidien rapide',
  },
  robot: {
    label: 'Robots aspirateurs',
    labelEn: 'Robot vacuums',
    color: 'var(--color-robot)',
    icon: '🤖',
    description: 'Autonomes, programmables, pour maintenir un sol propre sans effort',
  },
  traineau: {
    label: 'Aspirateurs traîneau',
    labelEn: 'Canister vacuums',
    color: 'var(--color-traineau)',
    icon: '🏠',
    description: 'Puissants et filaires, la référence pour les grandes surfaces',
  },
  laveur: {
    label: 'Laveurs de sol',
    labelEn: 'Floor washers',
    color: 'var(--color-laveur)',
    icon: '💧',
    description: 'Aspirent et lavent simultanément — pour des sols vraiment propres',
  },
  accessoires: {
    label: 'Accessoires',
    labelEn: 'Accessories',
    color: 'var(--color-accessoires)',
    icon: '🔧',
    description: 'Filtres, brosses, sacs et pièces de rechange',
  },
}

export const categoryOrder: ProductCategory[] = ['balai', 'robot', 'traineau', 'laveur', 'accessoires']
