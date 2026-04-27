/**
 * HTML ↔ Markdown converter for TipTap.
 *
 * Preserved-block strategy:
 * - MDX component blocks (JSX) et shortcodes ([[…]]) sont extraits AVANT la
 *   conversion Markdown→HTML et stockés sous forme de placeholders
 *   [[MDXBLOCK0]], [[MDXBLOCK1]]… Les placeholders survivent au round-trip
 *   MD→HTML→MD comme texte brut. À la sauvegarde, ils sont réinsérés à leur
 *   position d'origine.
 *
 * - Les tableaux GFM ne sont PAS extraits : ils transitent par les
 *   convertisseurs `gfmTableToHtml` / `htmlTableToGfm` ci-dessous, ce qui
 *   permet à TipTap (avec l'extension Table) de les rendre comme de vrais
 *   tableaux éditables dans le WYSIWYG.
 */

// ─── Block extraction ────────────────────────────────────────────────────────

const MDX_PLACEHOLDER_RE = /\[\[MDXBLOCK(\d+)\]\]/g

// Matches self-closing JSX: <ComponentName ... />  or block JSX: <ComponentName>...</ComponentName>
const JSX_BLOCK_RE =
  /(?:^|\n)(<[A-Z][a-zA-Z0-9]*(?:\s[^>]*)?\/>|<([A-Z][a-zA-Z0-9]*)(?:\s[^>]*)?>[\s\S]*?<\/\2>)/g

// Shortcode blocks: [[tip …]]…[[/tip]], [[warning …]]…[[/warning]], etc.
const SHORTCODE_BLOCK_RE =
  /(?:^|\n)(\[\[[a-z]+[^\]]*\]\][\s\S]*?\[\[\/[a-z]+\]\])/g

// Inline shortcodes: [[product:slug]], [[stat …]], etc.
const SHORTCODE_INLINE_RE =
  /(\[\[[a-z]+(?::[^\]]+|[^\]]*)\]\])/g

export function extractMdxBlocks(markdown: string): {
  cleaned: string
  blocks: Record<string, string>
} {
  const blocks: Record<string, string> = {}
  let idx = 0

  function extract(match: string, captured: string): string {
    const key = `[[MDXBLOCK${idx++}]]`
    blocks[key.slice(2, -2)] = captured.trim()
    return `\n\n${key}\n\n`
  }

  let cleaned = markdown
  cleaned = cleaned.replace(JSX_BLOCK_RE, (_m, p1) => extract(_m, p1))
  cleaned = cleaned.replace(SHORTCODE_BLOCK_RE, (_m, p1) => extract(_m, p1))
  cleaned = cleaned.replace(SHORTCODE_INLINE_RE, (_m, p1) => extract(_m, p1))

  return { cleaned: cleaned.trim(), blocks }
}

export function reinsertMdxBlocks(markdown: string, blocks: Record<string, string>): string {
  return markdown.replace(MDX_PLACEHOLDER_RE, (match) => {
    const key = match.slice(2, -2)
    return blocks[key] ?? match
  })
}

// ─── Markdown → HTML (for TipTap) ────────────────────────────────────────────

export function markdownToHtml(md: string): string {
  let html = md

  // Fenced code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const escaped = escapeHtml(code.trimEnd())
    return `<pre><code class="language-${lang}">${escaped}</code></pre>`
  })

  // Inline code
  html = html.replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`)

  // GFM tables (convert any remaining — normally extracted, but just in case)
  html = html.replace(
    /(?:^|\n)((?:\|[^\n]+\|\s*\n)\|[\s:|-]+\|\s*\n(?:\|[^\n]+\|\s*\n?)+)/gm,
    (_, table) => gfmTableToHtml(table),
  )

  // Headings
  html = html.replace(/^#{6}\s+(.+)$/gm, '<h6>$1</h6>')
  html = html.replace(/^#{5}\s+(.+)$/gm, '<h5>$1</h5>')
  html = html.replace(/^#{4}\s+(.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^#{3}\s+(.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^#{2}\s+(.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^#{1}\s+(.+)$/gm, '<h1>$1</h1>')

  // Blockquotes
  html = html.replace(/^>\s(.+)$/gm, '<blockquote><p>$1</p></blockquote>')

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr>')

  // Unordered lists
  html = html.replace(/((?:^[-*+]\s.+\n?)+)/gm, (block) => {
    const items = block
      .trim()
      .split('\n')
      .map((l) => `<li>${l.replace(/^[-*+]\s/, '').trim()}</li>`)
      .join('')
    return `<ul>${items}</ul>`
  })

  // Ordered lists
  html = html.replace(/((?:^\d+\.\s.+\n?)+)/gm, (block) => {
    const items = block
      .trim()
      .split('\n')
      .map((l) => `<li>${l.replace(/^\d+\.\s/, '').trim()}</li>`)
      .join('')
    return `<ol>${items}</ol>`
  })

  // Bold + italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')
  html = html.replace(/_(.+?)_/g, '<em>$1</em>')

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<s>$1</s>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // Images (inside editor body — shown as alt text fallback)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')

  // Paragraphs: split on double newlines
  const blocks = html.split(/\n\n+/)
  html = blocks
    .map((block) => {
      const t = block.trim()
      if (!t) return ''
      if (/^<(h[1-6]|ul|ol|blockquote|pre|hr|img|table)/.test(t)) return t
      return `<p>${t.replace(/\n/g, '<br>')}</p>`
    })
    .filter(Boolean)
    .join('\n')

  return html
}

// ─── HTML → Markdown (from TipTap) ───────────────────────────────────────────

export function htmlToMarkdown(html: string): string {
  let md = html

  // Pre-process: normalize self-closing tags
  md = md.replace(/<br\s*\/?>/gi, '\n')
  md = md.replace(/<hr\s*\/?>/gi, '\n---\n')

  // Code blocks (must come before inline code)
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (_, code) => {
    return `\n\`\`\`\n${unescapeHtml(code)}\n\`\`\`\n`
  })

  // Inline code
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, code) => `\`${unescapeHtml(code)}\``)

  // Tables — must come before stripTags
  md = md.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, inner) => htmlTableToGfm(inner))

  // Headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `\n# ${stripTags(t).trim()}\n`)
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n## ${stripTags(t).trim()}\n`)
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n### ${stripTags(t).trim()}\n`)
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, t) => `\n#### ${stripTags(t).trim()}\n`)
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, (_, t) => `\n##### ${stripTags(t).trim()}\n`)
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, (_, t) => `\n###### ${stripTags(t).trim()}\n`)

  // Blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, t) => {
    const inner = stripTags(t).trim()
    return `\n> ${inner}\n`
  })

  // Lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, t) => {
    const items = [...t.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    return '\n' + items.map(([, item]) => `- ${stripTags(item).trim()}`).join('\n') + '\n'
  })
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, t) => {
    const items = [...t.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    return '\n' + items.map(([, item], i) => `${i + 1}. ${stripTags(item).trim()}`).join('\n') + '\n'
  })

  // Bold + italic
  md = md.replace(/<strong[^>]*><em[^>]*>([\s\S]*?)<\/em><\/strong>/gi, '***$1***')
  md = md.replace(/<em[^>]*><strong[^>]*>([\s\S]*?)<\/strong><\/em>/gi, '***$1***')
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*')

  // Strikethrough
  md = md.replace(/<s[^>]*>([\s\S]*?)<\/s>/gi, '~~$1~~')

  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
    return `[${stripTags(text).trim()}](${href})`
  })

  // Images
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)')

  // Paragraphs
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, t) => `\n${stripTags(t).trim()}\n`)

  // Remaining tags
  md = stripTags(md)

  // Clean up whitespace
  md = md.replace(/\n{3,}/g, '\n\n').trim()

  return md
}

// ─── Table helpers ───────────────────────────────────────────────────────────

function splitTableRow(row: string): string[] {
  return row
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim())
}

function gfmTableToHtml(table: string): string {
  const lines = table.trim().split('\n').filter((l) => l.trim())
  if (lines.length < 2) return table

  const headers = splitTableRow(lines[0] ?? '')
  const rows = lines.slice(2).map((l) => splitTableRow(l))

  let html = '<table><thead><tr>'
  for (const h of headers) html += `<th>${h}</th>`
  html += '</tr></thead><tbody>'
  for (const row of rows) {
    html += '<tr>'
    for (const cell of row) html += `<td>${cell}</td>`
    html += '</tr>'
  }
  html += '</tbody></table>'
  return html
}

function htmlTableToGfm(inner: string): string {
  const headerCells = [...inner.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)]
    .map(([, c]) => stripTags(c ?? '').trim())

  const bodyRows: string[][] = []
  const trMatches = [...inner.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]

  // Skip the header <tr> (first one if it contains <th>)
  const dataRows = headerCells.length > 0 ? trMatches.slice(1) : trMatches
  for (const [, rowHtml] of dataRows) {
    if (!rowHtml) continue
    // Skip rows that only contain <th> (header row inside tbody)
    if (/<th[^>]*>/i.test(rowHtml) && !/<td[^>]*>/i.test(rowHtml)) continue
    const cells = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)]
      .map(([, c]) => stripTags(c ?? '').trim())
    if (cells.length > 0) bodyRows.push(cells)
  }

  if (headerCells.length === 0 && bodyRows.length === 0) return stripTags(inner)

  const colCount = Math.max(headerCells.length, bodyRows[0]?.length ?? 0)
  const heads = headerCells.length > 0
    ? headerCells
    : Array.from({ length: colCount }, () => '')

  const headerLine = '| ' + heads.join(' | ') + ' |'
  const separatorLine = '| ' + heads.map(() => '---').join(' | ') + ' |'
  const dataLines = bodyRows.map((row) => {
    const padded = Array.from({ length: colCount }, (_, i) => row[i] ?? '')
    return '| ' + padded.join(' | ') + ' |'
  })

  return '\n' + [headerLine, separatorLine, ...dataLines].join('\n') + '\n'
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function unescapeHtml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function stripTags(str: string): string {
  return str.replace(/<[^>]+>/g, '')
}
