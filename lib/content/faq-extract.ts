import type { FaqItem } from '@/lib/data/types'

/**
 * Extrait les Q/A d'une section `## FAQ` dans le corps MDX.
 *
 * Deux formats reconnus (en plus du Markdown classique avec `?` final) :
 *   ### Question                    → balise H3 puis paragraphe(s) réponse
 *   **Question ?**                  → paragraphe gras puis paragraphe(s) réponse
 *
 * Les séparateurs `---` entre Q/A sont ignorés. La section s'arrête au prochain
 * `## ` ou en fin de fichier. La fonction retourne un tableau vide si aucune
 * section FAQ n'est trouvée.
 */
export function extractFaqFromBody(content: string): FaqItem[] {
  const items: FaqItem[] = []
  const lines = content.split('\n')

  // Localiser la section ## FAQ
  let start = -1
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+FAQ\b/i.test(lines[i] ?? '')) {
      start = i + 1
      break
    }
  }
  if (start === -1) return items

  // Borner la section au prochain ## ou à la fin
  let end = lines.length
  for (let i = start; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (/^##\s/.test(line) && !/^##\s+FAQ\b/i.test(line)) {
      end = i
      break
    }
  }

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
 * Retire la section `## FAQ` du corps MDX (heading inclus) jusqu'au prochain
 * H2 ou à la fin. Utilisé pour éviter le doublon visuel avec l'accordéon FAQ.
 */
export function stripFaqSection(content: string): string {
  const lines = content.split('\n')

  let start = -1
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+FAQ\b/i.test(lines[i] ?? '')) {
      start = i
      break
    }
  }
  if (start === -1) return content

  let end = lines.length
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (/^##\s/.test(line) && !/^##\s+FAQ\b/i.test(line)) {
      end = i
      break
    }
  }

  // Conserver une seule ligne vide à la jointure
  const before = lines.slice(0, start).join('\n').replace(/\n+$/, '')
  const after = lines.slice(end).join('\n').replace(/^\n+/, '')
  if (!after) return before
  return `${before}\n\n${after}`
}
