// Variables dynamiques dans le contenu — syntaxe [[var:champ.slug]]
//
// Source : fiches produit du CMS (content/products/*.yaml) via getAllCmsProducts().
// Aucune donnée hardcodée — tout slug présent dans le CMS est résolvable.
//
// Champs disponibles :
//   price    → "599 €"
//   name     → "Dyson V15 Detect Absolute"
//   brand    → "Dyson"
//   score    → "7.5"        (alias de rating)
//   rating   → "7.5"
//   autonomy → "60 min"
//   noise    → "78 dB"
//   weight   → "3.1 kg"
//   power    → "22000 Pa"
//
// Exemple : [[var:price.x-clean-4]] → "380 €"
// Slug ou champ inconnu → shortcode laissé tel quel pour faciliter le debug.

import { getAllCmsProducts, type CmsProduct } from '@/lib/content/products'

type FieldResolver = (p: CmsProduct) => string | null

const FIELD_MAP: Record<string, FieldResolver> = {
  price:    (p) => `${p.priceEur} €`,
  name:     (p) => p.name,
  brand:    (p) => p.brand,
  score:    (p) => String(p.rating),
  rating:   (p) => String(p.rating),
  autonomy: (p) => (p.autonomyMin === null ? null : `${p.autonomyMin} min`),
  noise:    (p) => (p.noiseDb === null ? null : `${p.noiseDb} dB`),
  weight:   (p) => (p.weightKg === null ? null : `${p.weightKg} kg`),
  power:    (p) => (p.suctionPowerPa === null || p.suctionPowerPa === 0 ? null : `${p.suctionPowerPa} Pa`),
}

/** Échappe les caractères HTML dangereux dans une valeur résolue avant injection dans le MDX. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function resolveVar(field: string, slug: string, products: CmsProduct[]): string | null {
  const resolver = FIELD_MAP[field]
  if (!resolver) return null
  const product = products.find((p) => p.slug === slug)
  if (!product) return null
  const value = resolver(product)
  return value === null ? null : escapeHtml(value)
}

const VAR_RE = /\[\[var:([a-z]+)\.([^\]\s]+)\]\]/g

export function resolveVariables(content: string): string {
  if (!VAR_RE.test(content)) return content
  VAR_RE.lastIndex = 0
  const products = getAllCmsProducts()
  return content.replace(VAR_RE, (match, field, slug) => {
    const value = resolveVar(field, slug, products)
    return value ?? match
  })
}
