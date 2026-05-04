import fs from 'fs'
import path from 'path'
import type { ProductCategory } from '@/lib/data/types'

export interface CmsBrand {
  slug: string
  name: string
  country: string
  positioning: string
  categories: ProductCategory[]
}

function parseYaml(raw: string): { scalar: Record<string, string>; lists: Record<string, string[]> } {
  const scalar: Record<string, string> = {}
  const lists: Record<string, string[]> = {}
  let currentList: string[] | null = null
  let currentKey: string | null = null
  for (const line of raw.split('\n')) {
    const listItem = line.match(/^\s+-\s+(.+)$/)
    if (listItem && listItem[1] && currentKey) { currentList?.push(listItem[1].trim()); continue }
    const kv = line.match(/^(\w[\w]*):\s*(.*)$/)
    if (kv) {
      currentKey = kv[1] ?? null
      const v = (kv[2] ?? '').trim().replace(/^['"]|['"]$/g, '')
      if (!currentKey) continue
      if (v === '' || v === '[]') { const list: string[] = []; lists[currentKey] = list; currentList = list }
      else { scalar[currentKey] = v; currentList = null }
    }
  }
  return { scalar, lists }
}

const VALID_CATEGORIES = new Set<string>(['balai', 'robot', 'traineau', 'laveur', 'accessoires'])

export function getAllBrands(): CmsBrand[] {
  const dir = path.join(process.cwd(), 'content/brands')
  let files: string[]
  try {
    files = fs.readdirSync(dir).filter(f => f.endsWith('.yaml') && !f.startsWith('.'))
  } catch {
    return []
  }
  return files.map(file => {
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8')
    const { scalar, lists } = parseYaml(raw)
    const categories = (lists.categories ?? []).filter(c => VALID_CATEGORIES.has(c)) as ProductCategory[]
    return {
      slug: file.replace('.yaml', ''),
      name: scalar.name ?? '',
      country: scalar.country ?? '',
      positioning: scalar.positioning ?? '',
      categories,
    }
  }).filter(b => b.name)
}

export function getBrandBySlug(slug: string): CmsBrand | undefined {
  return getAllBrands().find(b => b.slug === slug)
}
