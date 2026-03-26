import type { ContentEntry } from '../types'

// ─── YAML utilities (no external dep) ───────────────────────────────────────

function parseYamlValue(raw: string): unknown {
  const s = raw.trim()
  if (s === 'true') return true
  if (s === 'false') return false
  if (s === 'null' || s === '~') return null
  if (/^\d+$/.test(s)) return parseInt(s, 10)
  if (/^\d+\.\d+$/.test(s)) return parseFloat(s)
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'")
  }
  return s
}

function parseYamlFrontmatter(yaml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  const lines = yaml.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (line === undefined) break
    if (!line.trim() || line.trim().startsWith('#')) { i++; continue }

    const keyMatch = line.match(/^(\s*)([^:#\s][^:]*?):\s*(.*)$/)
    if (!keyMatch) { i++; continue }

    const indent = (keyMatch[1] ?? '').length
    const key = (keyMatch[2] ?? '').trim()
    const valueRaw = (keyMatch[3] ?? '').trim()

    if (indent > 0) { i++; continue }

    if (valueRaw === '') {
      const children: unknown[] = []
      i++
      while (i < lines.length) {
        const child = lines[i]
        if (child === undefined) break
        if (!child.trim()) { i++; continue }
        const childIndent = child.match(/^(\s*)/)?.[1]?.length ?? 0
        if (childIndent === 0) break

        const listItem = child.match(/^\s+-\s+(.*)$/)
        if (listItem) {
          const val = (listItem[1] ?? '').trim()
          const nextLine = lines[i + 1]
          const nextIndent = nextLine?.match(/^(\s*)/)?.[1]?.length ?? 0
          if (nextIndent > childIndent || (nextLine != null && /^\s+\w+:/.test(nextLine))) {
            const obj: Record<string, unknown> = {}
            const firstKv = val.match(/^([^:]+):\s*(.*)$/)
            if (firstKv) obj[(firstKv[1] ?? '').trim()] = parseYamlValue(firstKv[2] ?? '')
            i++
            while (i < lines.length) {
              const objLine = lines[i]
              if (objLine === undefined) break
              const objIndent = objLine.match(/^(\s*)/)?.[1]?.length ?? 0
              if (objIndent <= childIndent && objLine.trim() && !/^\s+-/.test(objLine)) break
              const objKv = objLine.match(/^\s+([^:]+):\s*(.*)$/)
              if (objKv != null && !/^\s+-/.test(objLine)) {
                obj[(objKv[1] ?? '').trim()] = parseYamlValue(objKv[2] ?? '')
              }
              i++
            }
            children.push(obj)
          } else {
            children.push(parseYamlValue(val))
            i++
          }
        } else {
          break
        }
      }
      result[key] = children
    } else {
      result[key] = parseYamlValue(valueRaw)
      i++
    }
  }
  return result
}

function stringifyYamlValue(val: unknown): string {
  if (val === null || val === undefined) return 'null'
  if (typeof val === 'boolean') return val ? 'true' : 'false'
  if (typeof val === 'number') return String(val)
  if (typeof val === 'string') {
    if (
      val.includes(':') ||
      val.includes('#') ||
      val.includes('"') ||
      val.includes("'") ||
      val.startsWith(' ') ||
      val.endsWith(' ')
    ) {
      return `"${val.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
    }
    return val
  }
  return String(val)
}

export function stringifyYaml(obj: Record<string, unknown>, indent = 0): string {
  const lines: string[] = []
  const pad = ' '.repeat(indent)

  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined) continue

    if (Array.isArray(val)) {
      lines.push(`${pad}${key}:`)
      for (const item of val) {
        if (item !== null && typeof item === 'object') {
          const entries = Object.entries(item as Record<string, unknown>)
          if (entries.length === 0) continue
          const first = entries[0]
          if (!first) continue
          lines.push(`${pad}  - ${first[0]}: ${stringifyYamlValue(first[1])}`)
          for (let i = 1; i < entries.length; i++) {
            const entry = entries[i]
            if (!entry) continue
            lines.push(`${pad}    ${entry[0]}: ${stringifyYamlValue(entry[1])}`)
          }
        } else {
          lines.push(`${pad}  - ${stringifyYamlValue(item)}`)
        }
      }
    } else if (val !== null && typeof val === 'object') {
      lines.push(`${pad}${key}:`)
      lines.push(stringifyYaml(val as Record<string, unknown>, indent + 2))
    } else {
      lines.push(`${pad}${key}: ${stringifyYamlValue(val)}`)
    }
  }
  return lines.join('\n')
}

// ─── MDX frontmatter ────────────────────────────────────────────────────────

export function parseMdx(raw: string): ContentEntry {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) {
    return { slug: '', filePath: '', frontmatter: {}, body: raw }
  }
  const frontmatter = parseYamlFrontmatter(match[1] ?? '')
  const body = (match[2] ?? '').trimStart()
  return { slug: String(frontmatter.slug ?? ''), filePath: '', frontmatter, body }
}

export function stringifyMdx(frontmatter: Record<string, unknown>, body: string): string {
  const yaml = stringifyYaml(frontmatter)
  return `---\n${yaml}\n---\n\n${body}`
}

// ─── Slug derivation ─────────────────────────────────────────────────────────

export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// ─── Import .md file ─────────────────────────────────────────────────────────

export function importMarkdownFile(raw: string): {
  frontmatter: Record<string, unknown>
  body: string
} {
  if (raw.startsWith('---')) {
    const entry = parseMdx(raw)
    return { frontmatter: entry.frontmatter, body: entry.body }
  }
  const lines = raw.split('\n')
  let title = ''
  let excerpt = ''
  let bodyStart = 0
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (!title && line.startsWith('# ')) {
      title = line.replace(/^# /, '').trim()
      bodyStart = i + 1
    } else if (title && !excerpt && line.trim()) {
      excerpt = line.trim()
      bodyStart = i + 1
      break
    }
  }
  const body = lines.slice(bodyStart).join('\n').trimStart()
  return { frontmatter: { title, excerpt }, body }
}
