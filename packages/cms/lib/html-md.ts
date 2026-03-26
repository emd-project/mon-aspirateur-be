/**
 * HTML ↔ Markdown converter for TipTap.
 *
 * Bug 2+3 fix strategy:
 * - MDX component blocks (JSX) are extracted BEFORE Markdown→HTML conversion
 *   and stored with placeholder tokens [[MDX_BLOCK_0]], [[MDX_BLOCK_1]], etc.
 * - The placeholders survive the MD→HTML→MD round-trip as plain text.
 * - On save, MDX blocks are reinserted at their original positions.
 *
 * This means WYSIWYG mode edits standard prose only;
 * MDX components are preserved verbatim.
 */

// ─── MDX block extraction ─────────────────────────────────────────────────────

const MDX_PLACEHOLDER_RE = /\[\[MDX_BLOCK_(\d+)\]\]/g

// Matches self-closing JSX: <ComponentName ... />  or block JSX: <ComponentName>...</ComponentName>
// Also matches JSX-like "---" separators that are standalone lines between MDX
const JSX_BLOCK_RE =
  /(?:^|\n)(<[A-Z][a-zA-Z0-9]*(?:\s[^>]*)?\/>|<([A-Z][a-zA-Z0-9]*)(?:\s[^>]*)?>[\s\S]*?<\/\2>)/g

export function extractMdxBlocks(markdown: string): {
  cleaned: string
  blocks: Record<string, string>
} {
  const blocks: Record<string, string> = {}
  let idx = 0
  const cleaned = markdown.replace(JSX_BLOCK_RE, (match, p1) => {
    const key = `[[MDX_BLOCK_${idx++}]]`
    blocks[key.slice(2, -2)] = p1.trim()
    return `\n\n${key}\n\n`
  })
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
      // Already a block element?
      if (/^<(h[1-6]|ul|ol|blockquote|pre|hr|img)/.test(t)) return t
      return `<p>${t.replace(/\n/g, '<br>')}</p>`
    })
    .filter(Boolean)
    .join('\n')

  return html
}

// ─── HTML → Markdown (from TipTap) ───────────────────────────────────────────

export function htmlToMarkdown(html: string): string {
  // Use regex-based serializer (works in browser + Node.js without DOM)
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
