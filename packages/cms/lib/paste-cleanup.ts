/**
 * Paste cleanup — pré-traite l'HTML collé depuis Google Docs / Word / Notion.
 *
 * Pourquoi : Google Docs et consorts injectent du bruit (`<style>`, `<meta>`,
 * commentaires, wrappers `docs-internal-guid`, attributs `style="…"` massifs)
 * qui pollue le DOM rendu par TipTap. On nettoie en amont pour que la sortie
 * du WYSIWYG soit propre.
 *
 * Les `<table>` sont conservés tels quels — TipTap les rend nativement grâce
 * à l'extension Table. On nettoie simplement le contenu des cellules pour
 * retirer les `<span style="…">` inutiles et les paragraphes imbriqués que
 * Google Docs glisse dans chaque `<td>`.
 */

const GOOGLE_DOCS_GUID_RE = /<b\s+id="docs-internal-guid-[^"]*"[^>]*>([\s\S]*?)<\/b>/gi
const STYLE_BLOCK_RE = /<style[\s\S]*?<\/style>/gi
const META_TAG_RE = /<meta\b[^>]*\/?>/gi
const COMMENT_RE = /<!--[\s\S]*?-->/g
// Espaces insécables hérités de Google Docs (entité, entités numériques, et le
// caractère U+00A0 lui-même). Convertis en espace normal pour éviter qu'ils ne
// se retrouvent dans le Markdown stocké et créent des écarts de mise en page.
const NBSP_RE = /&nbsp;|&#160;|&#xA0;| /gi
const TABLE_RE = /<table\b[^>]*>([\s\S]*?)<\/table>/gi
const CELL_OPEN_RE = /<(t[hd])\b[^>]*>/gi
const CELL_CLOSE_RE = /<\/(t[hd])>/gi
const STYLE_ATTR_RE = /\s+style="[^"]*"/gi
const CLASS_ATTR_RE = /\s+class="[^"]*"/gi
const ID_ATTR_RE = /\s+id="[^"]*"/gi

/**
 * Nettoie le contenu d'une cellule de tableau :
 * - retire les `<p>`/`<div>`/`<h*>` imbriqués (les remplace par leur contenu)
 * - retire les `<span>` inutiles (souvent juste des wrappers de style Google Docs)
 * - normalise les `<b>`/`<i>` vers `<strong>`/`<em>`
 */
function cleanCellHtml(inner: string): string {
  let out = inner
  out = out.replace(/<\/?(p|div|h[1-6])\b[^>]*>/gi, '')
  out = out.replace(/<span\b[^>]*>([\s\S]*?)<\/span>/gi, '$1')
  out = out.replace(/<b(\s[^>]*)?>/gi, '<strong>').replace(/<\/b>/gi, '</strong>')
  out = out.replace(/<i(\s[^>]*)?>/gi, '<em>').replace(/<\/i>/gi, '</em>')
  return out.trim()
}

/**
 * Nettoie l'intérieur d'un `<table>` : retire les attributs style/class/id
 * de chaque cellule, supprime les `<colgroup>`, et nettoie les contenus de
 * cellule.
 */
function cleanTableInner(inner: string): string {
  let out = inner
  // Retirer <colgroup>...</colgroup> (souvent injecté par Google Docs)
  out = out.replace(/<colgroup\b[\s\S]*?<\/colgroup>/gi, '')
  // Retirer les attributs des balises <table>/<tr>/<td>/<th>/<thead>/<tbody>
  out = out.replace(/<(table|tr|td|th|thead|tbody)\b[^>]*>/gi, '<$1>')
  // Nettoyer le contenu de chaque cellule
  out = out.replace(/<(t[hd])>([\s\S]*?)<\/\1>/gi, (_m, tag, body) => {
    return `<${tag}>${cleanCellHtml(String(body ?? ''))}</${tag}>`
  })
  return out
}

/**
 * Transforme l'HTML collé pour qu'il survive au passage dans TipTap.
 *
 * - Retire les blocs `<style>`, balises `<meta>`, commentaires HTML
 * - Convertit les espaces insécables (`&nbsp;`, U+00A0) en espace normal
 * - Retire les wrappers Google Docs (`<b id="docs-internal-guid-…">`)
 * - Retire les attributs `style`/`class`/`id` envahissants
 * - Nettoie les tableaux pour que l'extension Table de TipTap les ingère
 *   sans avaler de spans inutiles
 * - Normalise `<b>`/`<i>` vers `<strong>`/`<em>`
 */
export function cleanPastedHTML(html: string): string {
  if (!html || !/[<&]/.test(html)) return html

  let out = html

  // Bruit en bloc
  out = out.replace(STYLE_BLOCK_RE, '')
  out = out.replace(META_TAG_RE, '')
  out = out.replace(COMMENT_RE, '')

  // Espaces insécables → espace normal (avant le déballage des tableaux/spans)
  out = out.replace(NBSP_RE, ' ')

  // Déballer le wrapper docs-internal-guid avant les autres transformations
  out = out.replace(GOOGLE_DOCS_GUID_RE, (_m, inner) => String(inner ?? ''))

  // Nettoyer les tableaux d'abord (avant le strip global d'attributs)
  out = out.replace(TABLE_RE, (_m, inner) => `<table>${cleanTableInner(String(inner ?? ''))}</table>`)

  // Strip global des attributs style/class/id (hors tableaux déjà nettoyés)
  out = out.replace(STYLE_ATTR_RE, '')
  out = out.replace(CLASS_ATTR_RE, (m) => (/tt-table/.test(m) ? m : ''))
  out = out.replace(ID_ATTR_RE, '')

  // Normaliser bold / italic hors-tableau
  out = out.replace(/<b(\s[^>]*)?>/gi, '<strong>').replace(/<\/b>/gi, '</strong>')
  out = out.replace(/<i(\s[^>]*)?>/gi, '<em>').replace(/<\/i>/gi, '</em>')

  return out
}

// Helpers exportés pour les tests / réutilisation côté serveur
export { cleanCellHtml, cleanTableInner, CELL_OPEN_RE, CELL_CLOSE_RE }
