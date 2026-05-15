// Variables dynamiques dans le contenu — syntaxe [[var:champ.slug]]
//
// Champs disponibles :
//   price   → "349 €"
//   name    → "RoboVac LiDAR Pro"
//   brand   → "EcoVacs"
//   score   → "91"
//   autonomy → "110 min"
//   noise   → "62 dB"
//   surface → "120 m²"
//
// Exemple : [[var:price.dyson-v15-detect]] → "599 €"
// Produit inconnu ou champ inconnu → laisse le shortcode intact pour faciliter le debug.

import { PRODUCTS } from '@/lib/data/mock/products'
import type { Product } from '@/lib/data/types'

const FIELD_MAP: Record<string, (p: Product) => string> = {
  price:    (p) => `${p.priceEur} €`,
  name:     (p) => p.name,
  brand:    (p) => p.brand,
  score:    (p) => String(p.score),
  autonomy: (p) => `${p.autonomyMin} min`,
  noise:    (p) => `${p.noiseDb} dB`,
  surface:  (p) => `${p.surfaceM2Max} m²`,
}

function resolveVar(field: string, slug: string): string | null {
  const resolver = FIELD_MAP[field]
  if (!resolver) return null
  const product = PRODUCTS.find((p) => p.slug === slug)
  if (!product) return null
  return resolver(product)
}

const VAR_RE = /\[\[var:([a-z]+)\.([^\]\s]+)\]\]/g

export function resolveVariables(content: string): string {
  return content.replace(VAR_RE, (match, field, slug) => {
    const value = resolveVar(field, slug)
    return value ?? match
  })
}
