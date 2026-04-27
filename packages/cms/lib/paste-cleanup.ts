/**
 * Paste cleanup — pré-traite l'HTML collé depuis Google Docs / Word / Notion.
 *
 * Pourquoi : TipTap StarterKit n'inclut pas l'extension Table. Quand on colle
 * un tableau Google Docs, le `<table>` est dépouillé et chaque `<td>` devient
 * un `<p>` indépendant — le tableau ressort dans le MDX final comme une liste
 * verticale de cellules séparées par des sauts de ligne, illisible.
 *
 * Stratégie : avant que TipTap n'ingère l'HTML collé, on convertit chaque
 * `<table>` en GFM markdown (`| col1 | col2 |\n| --- | --- |\n…`) et on
 * l'enveloppe dans un `<p>` avec `<br>` entre chaque ligne. TipTap conserve
 * alors le texte tel quel ; au save, `htmlToMarkdown` le restitue en GFM
 * valide ; au prochain reload, `extractMdxBlocks` le reconnaît comme un bloc
 * MDX préservé (les tableaux s'éditent ensuite en mode Source).
 */

const GOOGLE_DOCS_GUID_RE = /<b\s+id="docs-internal-guid-[^"]*"[^>]*>([\s\S]*?)<\/b>/gi
const STYLE_BLOCK_RE = /<style[\s\S]*?<\/style>/gi
const META_TAG_RE = /<meta\b[^>]*\/?>/gi
const COMMENT_RE = /<!--[\s\S]*?-->/g
const TABLE_RE = /<table\b[^>]*>([\s\S]*?)<\/table>/gi
const TR_RE = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi
const CELL_RE = /<(t[hd])\b[^>]*>([\s\S]*?)<\/\1>/gi

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;|&#8217;/gi, '’')
    .replace(/&lsquo;|&#8216;/gi, '‘')
    .replace(/&ldquo;|&#8220;/gi, '“')
    .replace(/&rdquo;|&#8221;/gi, '”')
    .replace(/&hellip;|&#8230;/gi, '…')
    .replace(/&mdash;|&#8212;/gi, '—')
    .replace(/&ndash;|&#8211;/gi, '–')
}

function escapeForBrParagraph(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function cellInnerToText(inner: string): string {
  // Ne garder que le texte des cellules — Google Docs imbrique des <span style="…">,
  // <p>, <b>, etc. à l'intérieur. La cellule devient une chaîne single-line.
  let text = inner
  text = text.replace(/<br\s*\/?>/gi, ' ')
  text = text.replace(/<\/(p|div|h[1-6])>/gi, ' ')
  text = text.replace(/<[^>]+>/g, '')
  text = decodeEntities(text)
  text = text.replace(/\s+/g, ' ').trim()
  // Échapper les pipes pour ne pas casser le GFM
  text = text.replace(/\|/g, '\\|')
  return text
}

function tableHtmlToGfm(tableInner: string): string {
  const rows: string[][] = []
  const trMatches = [...tableInner.matchAll(TR_RE)]
  for (const [, rowHtml] of trMatches) {
    if (!rowHtml) continue
    const cells = [...rowHtml.matchAll(CELL_RE)].map(([, , c]) => cellInnerToText(c ?? ''))
    if (cells.length > 0) rows.push(cells)
  }

  if (rows.length === 0) return ''

  const colCount = Math.max(...rows.map((r) => r.length))
  const padded = rows.map((r) =>
    Array.from({ length: colCount }, (_, i) => r[i] ?? ''),
  )

  // Première rangée → header. Si elle est vide, on génère un header vide.
  const header = padded[0] ?? Array.from({ length: colCount }, () => '')
  const body = padded.slice(1)

  const headerLine = '| ' + header.join(' | ') + ' |'
  const separatorLine = '| ' + header.map(() => '---').join(' | ') + ' |'
  const dataLines = body.map((row) => '| ' + row.join(' | ') + ' |')

  return [headerLine, separatorLine, ...dataLines].join('\n')
}

/**
 * Transforme l'HTML collé pour qu'il survive au passage dans TipTap StarterKit.
 *
 * - Retire les wrappers Google Docs (`<b id="docs-internal-guid-…">`)
 * - Retire les blocs `<style>`, balises `<meta>`, commentaires HTML
 * - Convertit chaque `<table>` en GFM markdown texte enveloppé dans un `<p>`
 * - Normalise `<b>`/`<i>` vers `<strong>`/`<em>`
 */
export function cleanPastedHTML(html: string): string {
  if (!html || !/[<&]/.test(html)) return html

  let out = html

  // Supprimer le bruit Google Docs / Office
  out = out.replace(STYLE_BLOCK_RE, '')
  out = out.replace(META_TAG_RE, '')
  out = out.replace(COMMENT_RE, '')

  // Déballer le wrapper docs-internal-guid avant les autres transformations
  out = out.replace(GOOGLE_DOCS_GUID_RE, (_m, inner) => String(inner ?? ''))

  // Convertir les tableaux EN PREMIER, avant toute autre transformation,
  // pour ne pas se faire avaler les <td> par des regex naïves
  out = out.replace(TABLE_RE, (_m, inner) => {
    const gfm = tableHtmlToGfm(String(inner ?? ''))
    if (!gfm) return ''
    const lines = gfm.split('\n')
    return `<p>${lines.map(escapeForBrParagraph).join('<br>')}</p>`
  })

  // Normaliser bold / italic
  out = out.replace(/<b(\s[^>]*)?>/gi, '<strong>').replace(/<\/b>/gi, '</strong>')
  out = out.replace(/<i(\s[^>]*)?>/gi, '<em>').replace(/<\/i>/gi, '</em>')

  return out
}
