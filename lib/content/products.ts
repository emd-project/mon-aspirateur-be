import fs from 'fs'
import path from 'path'
import type { ProductCategory } from '@/lib/data/types'

export interface CmsProduct {
  slug: string
  name: string
  brand: string
  brandSlug: string
  category: ProductCategory
  priceEur: number
  rating: number
  description: string
  affiliateUrl: string
  autonomyMin: number | null
  noiseDb: number | null
  weightKg: number | null
  suctionPowerPa: number | null
  dimensions: string | null
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

/** Extract leading number from a YAML scalar (handles "5.4 kg", "60", null). */
function parseFloatField(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const match = String(v).match(/[\d.]+/)
  if (!match) return null
  const n = Number(match[0])
  return isNaN(n) || n <= 0 ? null : n
}

function parseIntField(v: unknown): number | null {
  const n = parseFloatField(v)
  return n === null ? null : Math.round(n)
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
        brandSlug: String(data.brandSlug ?? ''),
        category,
        priceEur,
        rating: isNaN(Number(data.rating)) ? 0 : Number(data.rating),
        description: String(data.description ?? ''),
        affiliateUrl: String(data.affiliateUrl ?? ''),
        autonomyMin: parseIntField(data.batteryMinutes),
        noiseDb: parseIntField(data.noiseLevelDb),
        weightKg: parseFloatField(data.weight),
        suctionPowerPa: parseIntField(data.suctionPower),
        dimensions: data.dimensions ? String(data.dimensions) : null,
      })
    } catch { /* skip */ }
  }
  return products
}
