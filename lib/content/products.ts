import fs from 'fs'
import path from 'path'
import type { ProductCategory } from '@/lib/data/types'

export interface CmsProduct {
  slug: string
  name: string
  brand: string
  category: ProductCategory
  priceEur: number
  rating: number
  description: string
  affiliateUrl: string
}

function parseYaml(raw: string): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  const lines = raw.split('\n')
  let currentList: string[] | null = null
  for (const line of lines) {
    const listItem = line.match(/^\s*-\s+(.+)$/)
    if (listItem && listItem[1]) { currentList?.push(listItem[1].trim()); continue }
    const kv = line.match(/^(\w[\w]*?):\s*(.*)$/)
    if (kv) {
      currentList = null
      const key = kv[1]
      const v = (kv[2] ?? '').trim().replace(/^['"]|['"]$/g, '')
      if (!key) continue
      if (v === '' || v === '[]') { const list: string[] = []; result[key] = list; currentList = list }
      else { const n = Number(v); result[key] = isNaN(n) || v === '' ? v : n }
    }
  }
  return result
}

function toCategory(type: unknown): ProductCategory | null {
  const t = String(type ?? '').toLowerCase()
  if (t.includes('robot')) return 'robot'
  if (t.includes('balai')) return 'balai'
  if (t.includes('tra')) return 'traineau'
  if (t.includes('laveur')) return 'laveur'
  return null
}

export function getAllCmsProducts(): CmsProduct[] {
  const dir = path.join(process.cwd(), 'content/products')
  let files: string[]
  try {
    files = fs.readdirSync(dir).filter(f => f.endsWith('.yaml') && !f.startsWith('.'))
  } catch {
    return []
  }

  const products: CmsProduct[] = []
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8')
      const data = parseYaml(raw)
      const category = toCategory(data.type)
      if (!category) continue
      const priceEur = Number(data.price)
      if (isNaN(priceEur) || priceEur <= 0) continue
      products.push({
        slug: file.replace('.yaml', ''),
        name: String(data.name ?? ''),
        brand: String(data.brand ?? ''),
        category,
        priceEur,
        rating: isNaN(Number(data.rating)) ? 0 : Number(data.rating),
        description: String(data.description ?? ''),
        affiliateUrl: String(data.affiliateUrl ?? ''),
      })
    } catch { /* skip */ }
  }
  return products
}
