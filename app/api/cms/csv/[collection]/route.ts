import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/packages/cms/lib/get-session'
import { listFilesRecursive, getFile, putFile } from '@/packages/cms/lib/github'
import { parseYaml, stringifyYaml } from '@/packages/cms/lib/parser'
import { cmsConfig } from '@/cms.config'
import type { FieldDef } from '@/packages/cms/types'

function getToken() {
  return process.env.CMS_GITHUB_TOKEN
}

// ─── CSV serialization helpers ───────────────────────────────────────────────

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function toCSVRow(values: string[]): string {
  return values.map(escapeCSV).join(',')
}

function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let inQuote = false
  let current = ''
  for (let i = 0; i < line.length; i++) {
    const char = line[i]!
    if (char === '"') {
      if (inQuote && line[i + 1] === '"') { current += '"'; i++ }
      else inQuote = !inQuote
    } else if (char === ',' && !inQuote) {
      values.push(current); current = ''
    } else {
      current += char
    }
  }
  values.push(current)
  return values
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  if (lines.length < 1) return []
  const headers = parseCSVLine(lines[0] ?? '')
  const rows: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line?.trim()) continue
    const values = parseCSVLine(line)
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => { row[h] = values[idx] ?? '' })
    rows.push(row)
  }
  return rows
}

// ─── Column derivation from collection fields ─────────────────────────────────

function getColumns(fields: Record<string, FieldDef>): string[] {
  const cols: string[] = ['slug']
  for (const [key, field] of Object.entries(fields)) {
    if (field.type === 'repeater') continue
    cols.push(key)
  }
  return cols
}

function frontmatterToRow(slug: string, fm: Record<string, unknown>, cols: string[]): string {
  return toCSVRow(cols.map((col) => {
    if (col === 'slug') return slug
    const val = fm[col]
    if (Array.isArray(val)) return val.join('|')
    return String(val ?? '')
  }))
}

function rowToFrontmatter(row: Record<string, string>, fields: Record<string, FieldDef>): Record<string, unknown> {
  const fm: Record<string, unknown> = {}
  for (const [key, field] of Object.entries(fields)) {
    if (field.type === 'repeater') continue
    const val = row[key] ?? ''
    if (field.type === 'list') {
      fm[key] = val ? val.split('|').map((s) => s.trim()).filter(Boolean) : []
    } else if (field.type === 'number') {
      fm[key] = val !== '' ? (Number(val) || 0) : ''
    } else {
      fm[key] = val
    }
  }
  return fm
}

// ─── Template sample row ──────────────────────────────────────────────────────

function buildSampleRow(cols: string[], fields: Record<string, FieldDef>): string {
  return toCSVRow(cols.map((col) => {
    if (col === 'slug') return 'exemple-produit'
    const field = fields[col]
    if (!field) return ''
    switch (field.type) {
      case 'number': return col.includes('price') ? '299' : col.includes('rating') ? '8.5' : col.includes('Minutes') ? '45' : col.includes('Db') ? '68' : '200'
      case 'list': return 'Valeur 1|Valeur 2'
      case 'image': return '/images/produit.jpg'
      case 'select': return field.options?.[0]?.value ?? ''
      default: return `${field.label}`
    }
  }))
}

// ─── GET — export or template ─────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { collection } = await params
  const collectionDef = cmsConfig.collections[collection]
  if (!collectionDef?.csvEnabled) return NextResponse.json({ error: 'Collection introuvable ou CSV désactivé' }, { status: 404 })

  const cols = getColumns(collectionDef.fields)
  const header = toCSVRow(cols)
  const isTemplate = req.nextUrl.searchParams.get('template') === '1'

  if (isTemplate) {
    const sample = buildSampleRow(cols, collectionDef.fields)
    const csv = [header, sample].join('\n')
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${collection}-template.csv"`,
      },
    })
  }

  // Export all entries
  try {
    const token = getToken()
    const files = await listFilesRecursive(cmsConfig.repo, collectionDef.path, cmsConfig.branch, token)
    const yamlFiles = files.filter((f) => f.name.endsWith('.yaml'))

    const rows = await Promise.all(
      yamlFiles.map(async (f) => {
        const file = await getFile(cmsConfig.repo, f.path, cmsConfig.branch, token)
        if (!file) return null
        const slug = f.name.replace(/\.yaml$/, '')
        const fm = parseYaml(file.content)
        return frontmatterToRow(slug, fm, cols)
      })
    )

    const csv = [header, ...rows.filter(Boolean)].join('\n')
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${collection}.csv"`,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur export'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// ─── POST — import ────────────────────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { collection } = await params
  const collectionDef = cmsConfig.collections[collection]
  if (!collectionDef?.csvEnabled) return NextResponse.json({ error: 'Collection introuvable ou CSV désactivé' }, { status: 404 })

  let csvText: string
  try {
    csvText = await req.text()
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  const rows = parseCSV(csvText)
  if (rows.length === 0) return NextResponse.json({ error: 'Fichier CSV vide ou invalide' }, { status: 400 })

  const token = getToken()
  const results = { imported: 0, updated: 0, errors: [] as string[] }

  for (const row of rows) {
    const slug = row.slug?.trim()
    if (!slug) { results.errors.push('Ligne ignorée : slug manquant'); continue }

    const fm = rowToFrontmatter(row, collectionDef.fields)
    const filePath = `${collectionDef.path}/${slug}.yaml`
    const content = stringifyYaml(fm)
    const commitMsg = `cms: import ${collection}/${slug}`

    try {
      const existing = await getFile(cmsConfig.repo, filePath, cmsConfig.branch, token)
      await putFile(cmsConfig.repo, filePath, cmsConfig.branch, content, commitMsg, existing?.sha, token)
      if (existing) { results.updated++ } else { results.imported++ }
    } catch (err) {
      results.errors.push(`${slug}: ${err instanceof Error ? err.message : 'erreur'}`)
    }
  }

  return NextResponse.json({ ok: true, ...results })
}
