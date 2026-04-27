/**
 * Source-mode paste helper — convertit un texte collé qui ressemble à un
 * tableau en GFM markdown.
 *
 * Cas couverts :
 * - Google Docs / Sheets text/plain : lignes tab-séparées (`a\tb\tc\n…`)
 * - Texte aplati par des colles de "paste-without-formatting" : on n'essaie
 *   pas de deviner — sans séparateur explicite c'est ambigu, on retourne
 *   le texte tel quel.
 *
 * Si le texte ne contient pas de tabulation, retourne `null` pour signaler
 * "rien à faire" — l'appelant garde alors le comportement de coller standard.
 */

export function tabbedTextToGfm(text: string): string | null {
  if (!text || !text.includes('\t')) return null

  const rawLines = text.replace(/\r\n/g, '\n').split('\n')
  // On ne garde que les lignes contenant au moins une tabulation
  const tabLines = rawLines.filter((l) => l.includes('\t'))
  if (tabLines.length < 1) return null

  const rows = tabLines.map((l) => l.split('\t').map((c) => c.trim().replace(/\|/g, '\\|')))
  const colCount = Math.max(...rows.map((r) => r.length))
  if (colCount < 2) return null

  const padded = rows.map((r) =>
    Array.from({ length: colCount }, (_, i) => r[i] ?? ''),
  )

  const header = padded[0] ?? Array.from({ length: colCount }, () => '')
  const body = padded.slice(1)

  const headerLine = '| ' + header.join(' | ') + ' |'
  const separatorLine = '| ' + header.map(() => '---').join(' | ') + ' |'
  const dataLines = body.map((row) => '| ' + row.join(' | ') + ' |')

  return [headerLine, separatorLine, ...dataLines].join('\n')
}
