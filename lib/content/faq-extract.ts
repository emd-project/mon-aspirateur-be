import type { FaqItem } from '@/lib/data/types'

/**
 * Extrait les Q/A d'une section `## FAQ` dans le corps MDX.
 *
 * Deux formats reconnus (en plus du Markdown classique avec `?` final) :
 *   ### Question                    → balise H3 puis paragraphe(s) réponse
 *   **Question ?**                  → paragraphe gras puis paragraphe(s) réponse
 *
 * Les séparateurs `---` entre Q/A sont ignorés. La section s'arrête au prochain
 * `## `, au prochain bloc éditorial (verdict, tip, warning, pullquote — sous
 * forme de shortcode `[[…]]` ou de JSX `<Verdict …>`) ou en fin de fichier.
 * La fonction retourne un tableau vide si aucune section FAQ n'est trouvée.
 *
 * Pourquoi borner sur les blocs : les imports Google Docs placent souvent la
 * conclusion (`[[verdict …]]`) APRÈS la FAQ, sans titre `##` intermédiaire.
 * Sans cette borne, la conclusion serait avalée par `stripFaqSection`.
 */
export function extractFaqFromBody(content: string): FaqItem[] {
  const items: FaqItem[] = []
  const lines = content.split('\n')

  const start = findFaqStart(lines)
  if (start === -1) return items
  const end = findFaqEnd(lines, start)

  // Découper en blocs séparés par des lignes vides
  const blocks: string[] = []
  let buffer: string[] = []
  for (let i = start; i < end; i++) {
    const line = lines[i] ?? ''
    if (line.trim() === '' || line.trim() === '---') {
      if (buffer.length > 0) {
        blocks.push(buffer.join('\n').trim())
        buffer = []
      }
    } else {
      buffer.push(line)
    }
  }
  if (buffer.length > 0) blocks.push(buffer.join('\n').trim())

  // Apparier les blocs en paires question / réponse
  let pendingQuestion: string | null = null
  for (const block of blocks) {
    const question = readQuestion(block)
    if (question) {
      // Si une question précédente n'a pas eu de réponse (ex. deux H3 d'affilée),
      // on la jette plutôt que de garder une FAQ orpheline.
      pendingQuestion = question
      continue
    }
    if (pendingQuestion) {
      items.push({ question: pendingQuestion, answer: block.trim() })
      pendingQuestion = null
    }
  }

  return items
}

/**
 * Reconnaît un bloc qui ne contient qu'une question.
 * Retourne le texte de la question ou `null` si ce n'est pas une question seule.
 */
function readQuestion(block: string): string | null {
  const trimmed = block.trim()

  // Format ### Question (single-line uniquement)
  if (!trimmed.includes('\n')) {
    const h3 = trimmed.match(/^###\s+(.+)$/)
    if (h3 && h3[1]) return h3[1].trim()
  }

  // Format **Question ?**  (paragraphe entièrement enveloppé en gras, single-line)
  if (!trimmed.includes('\n')) {
    const bold = trimmed.match(/^\*\*(.+?)\*\*[.!?\s]*$/)
    if (bold && bold[1]) {
      const inner = bold[1].trim()
      // Heuristique : on n'accepte que ce qui ressemble à une question
      // (se termine par un `?` ou commence par un mot interrogatif courant).
      if (/[?？]$/.test(inner) || /^(Quel|Quelle|Quels|Quelles|Comment|Pourquoi|Est-ce|Peut-on|Faut-il|Le|La|Les|Un|Une)\b/i.test(inner)) {
        return inner
      }
    }
  }

  return null
}

/**
 * Retire la section `## FAQ` du corps MDX (heading inclus) jusqu'à la borne de
 * fin de section. Utilisé pour éviter le doublon visuel avec l'accordéon FAQ.
 */
export function stripFaqSection(content: string): string {
  const lines = content.split('\n')

  const start = findFaqStart(lines)
  if (start === -1) return content
  const end = findFaqEnd(lines, start)

  // Conserver une seule ligne vide à la jointure
  const before = lines.slice(0, start).join('\n').replace(/\n+$/, '')
  const after = lines.slice(end).join('\n').replace(/^\n+/, '')
  if (!after) return before
  if (!before) return after
  return `${before}\n\n${after}`
}

// ─── Bornage de la section FAQ ───────────────────────────────────────────────

/** Index de la ligne `## FAQ`, ou -1. */
function findFaqStart(lines: string[]): number {
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+FAQ\b/i.test(lines[i] ?? '')) return i
  }
  return -1
}

// Blocs éditoriaux qui marquent la fin d'une section FAQ, qu'ils soient encore
// sous forme de shortcode (`[[verdict …]]`) ou déjà expansés en JSX (`<Verdict …>`).
const BLOCK_SHORTCODE_RE = /^\s*\[\[(tip|warning|verdict|pullquote)\b/i
const BLOCK_JSX_RE =
  /^\s*<(Verdict|Tip|Warning|PullQuote|TLDRBox|ProductCarousel|ProductCard|StatCard|ProConTable|ProductCTA|AISummarize|ArticleImage)\b/

/**
 * Première borne de fin après `start` : prochain `## ` (hors FAQ), prochain bloc
 * éditorial, ou fin de fichier.
 */
function findFaqEnd(lines: string[], start: number): number {
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (/^##\s/.test(line) && !/^##\s+FAQ\b/i.test(line)) return i
    if (BLOCK_SHORTCODE_RE.test(line) || BLOCK_JSX_RE.test(line)) return i
  }
  return lines.length
}
