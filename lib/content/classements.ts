import fs from 'fs'
import path from 'path'
import { getAllCmsProducts, type CmsProduct } from '@/lib/content/products'
import type { ProductCategory } from '@/lib/data/types'

/**
 * Classements = couche éditoriale (verdict, badge, rang) + vraie fiche produit.
 * Les données factuelles (nom, marque, prix, note, URL marchande) ne sont JAMAIS
 * dupliquées ici : elles proviennent exclusivement de content/products/*.yaml.
 * Un item dont la fiche produit n'existe pas est écarté silencieusement — pas de
 * placeholder, pas de prix inventé.
 */

export type FaqEntry = { q: string; a: string }

export interface ClassementItemRaw {
  rank: number
  productSlug: string
  badge: string
  bestFor: string
  verdict: string
}

export interface ClassementRaw {
  slug: string
  label: string
  category?: ProductCategory
  title: string
  updated: string
  intro: string
  tldr: string[]
  criteria: string[]
  methodology: string
  faq: FaqEntry[]
  items: ClassementItemRaw[]
}

export interface ClassementItem extends ClassementItemRaw {
  product: CmsProduct
}

export interface Classement extends Omit<ClassementRaw, 'items'> {
  items: ClassementItem[]
}

function readRaw(): Record<string, ClassementRaw> {
  const file = path.join(process.cwd(), 'content/data/classements.json')
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as Record<string, ClassementRaw>
  } catch {
    return {}
  }
}

function hydrate(raw: ClassementRaw, products: CmsProduct[]): Classement {
  const bySlug = new Map(products.map(p => [p.slug, p]))
  const items = raw.items
    .map(item => {
      const product = bySlug.get(item.productSlug)
      return product ? { ...item, product } : null
    })
    .filter((i): i is ClassementItem => i !== null)
    .sort((a, b) => a.rank - b.rank)

  return { ...raw, items }
}

export function getAllClassements(): Classement[] {
  const products = getAllCmsProducts()
  return Object.values(readRaw())
    .map(raw => hydrate(raw, products))
    .filter(c => c.items.length > 0)
}

export function getClassement(slug: string): Classement | undefined {
  const raw = readRaw()[slug]
  if (!raw) return undefined
  const classement = hydrate(raw, getAllCmsProducts())
  return classement.items.length > 0 ? classement : undefined
}

/** Slugs des classements réellement exploitables (au moins un produit réel). */
export function getClassementSlugs(): string[] {
  return getAllClassements().map(c => c.slug)
}
