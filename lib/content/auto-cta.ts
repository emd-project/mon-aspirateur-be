// Conversion automatique des liens d'achat « Voir … » isolés en boutons <ProductCTA>.
//
// Deux formes de liens d'affiliation cohabitent selon la source de rédaction :
//   • Rédaction Claude  : [Voir le X-Clean 7 sur rowenta.be](url)
//   • Import CMS / Docs : [Voir le X-Clean 7](url)            ← sans « sur domaine »
//
// Les deux doivent produire le même bouton. Le libellé « Voir sur <domaine> »
// est repris du texte du lien quand il contient « sur … », sinon dérivé du nom
// d'hôte de l'URL.
//
// Règle de déclenchement : le lien doit occuper TOUTE la ligne (^…$). Cela
// exclut les liens en milieu de phrase et les liens dans les cellules de
// tableau (qui commencent par `|`).

const VOIR_LINK_LINE = /^\[Voir\b([^\]]*)\]\(([^)]+)\)\s*$/gm

export function autoProductCTA(content: string): string {
  return content.replace(VOIR_LINK_LINE, (match, rest, url) => {
    const linkText = `Voir${rest}`.trim()

    // Forme « Voir <nom> sur <domaine> »
    const withDomain = linkText.match(/^Voir\s+(?:le |la |les |l')?(.+?)\s+sur\s+(.+)$/i)
    let name: string
    let label: string
    if (withDomain && withDomain[1] && withDomain[2]) {
      name = withDomain[1].trim()
      label = `Voir sur ${withDomain[2].trim()}`
    } else {
      name = linkText.replace(/^Voir\s+(?:le |la |les |l')?/i, '').trim()
      const host = hostFromUrl(url)
      label = host ? `Voir sur ${host}` : "Voir l'offre"
    }

    if (!name) return match // garde-fou : pas de nom exploitable → on ne touche pas

    const safeName = name.replace(/"/g, '&quot;')
    const safeLabel = label.replace(/"/g, '&quot;')
    return `<ProductCTA name="${safeName}" url="${url}" label="${safeLabel}" />`
  })
}

/** Nom d'hôte lisible d'une URL (sans `www.`), ou null pour `#`/URL relative. */
function hostFromUrl(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('/')) return null
  try {
    return new URL(trimmed).hostname.replace(/^www\./, '')
  } catch {
    const m = trimmed.match(/^https?:\/\/(?:www\.)?([^/]+)/i)
    return m && m[1] ? m[1] : null
  }
}
