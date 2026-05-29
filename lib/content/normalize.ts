// Normalisation typographique du MDX avant rendu.
//
// Pourquoi : les imports Google Docs / Word laissent des espaces insécables
// (`&nbsp;`, `&#160;`, U+00A0), souvent mal placés (fin de phrase, début de
// titre, `&nbsp;!&nbsp;`), et des espaces traînants en fin de ligne. Ces
// artefacts créent des écarts de mise en page invisibles à la rédaction mais
// visibles à l'écran. La rédaction via Claude n'en produit pas, d'où la
// divergence d'aspect entre les deux sources.
//
// Cette fonction est appliquée au rendu (et non au fichier) : elle harmonise
// l'affichage sans modifier le contenu stocké en repo.

const NBSP_RE = /&nbsp;|&#160;|&#xA0;| /gi

export function normalizeMdxWhitespace(content: string): string {
  const withoutNbsp = content.replace(NBSP_RE, ' ')

  const trimmedLines = withoutNbsp
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, '')) // espaces traînants
    .join('\n')

  // Réduire les suites d'espaces (jamais les retours à la ligne) en un seul.
  return trimmedLines.replace(/ {2,}/g, ' ')
}
