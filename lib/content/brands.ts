import fs from 'fs'
import path from 'path'

export interface CmsBrand {
  slug: string
  name: string
  country: string
  positioning: string
}

function parseSimpleYaml(raw: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const line of raw.split('\n')) {
    const m = line.match(/^(\w[\w]*):\s*(.*)$/)
    if (!m) continue
    result[m[1]!] = (m[2] ?? '').trim().replace(/^['"]|['"]$/g, '')
  }
  return result
}

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
    const data = parseSimpleYaml(raw)
    return {
      slug: file.replace('.yaml', ''),
      name: data.name ?? '',
      country: data.country ?? '',
      positioning: data.positioning ?? '',
    }
  }).filter(b => b.name)
}

export function getBrandBySlug(slug: string): CmsBrand | undefined {
  return getAllBrands().find(b => b.slug === slug)
}
