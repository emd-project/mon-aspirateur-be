// Shortcodes — syntaxe simple en double crochets pour les rédacteurs.
// Ne cassent pas si le WYSIWYG encode les `<` et `>`, parce que `[[...]]`
// traverse le round-trip TipTap sans transformation.
//
// Syntaxe :
//   Inline raccourci  : [[product:x-clean-4]]
//   Inline attributs  : [[stat value="45 min" label="Durée" sub="…"]]
//   Bloc avec contenu : [[tip title="Le vrai tip"]]Contenu…[[/tip]]
//
// Mapping des alias vers les composants MDX :
//   product → ProductCard · stat → StatCard · tldr → TLDRBox
//   procon → ProConTable · cta → ProductCTA · summary → AISummarize
//   tip → Tip · warning → Warning · verdict → Verdict · pullquote → PullQuote

export const SHORTCODE_COMPONENTS: Record<string, string> = {
  product: 'ProductCard',
  carousel: 'ProductCarousel',
  stat: 'StatCard',
  tldr: 'TLDRBox',
  procon: 'ProConTable',
  cta: 'ProductCTA',
  summary: 'AISummarize',
  tip: 'Tip',
  warning: 'Warning',
  verdict: 'Verdict',
  pullquote: 'PullQuote',
}

const BLOCK_ALIASES = new Set(['tip', 'warning', 'verdict', 'pullquote'])

function resolveComponent(alias: string): string {
  const lower = alias.toLowerCase()
  return SHORTCODE_COMPONENTS[lower] ?? alias
}

/**
 * Étape 1 — Défensif : décode les JSX encodés en HTML entities par le WYSIWYG.
 * Ex : `&lt;ProductCard slug="x-clean-4" /&gt;` → `<ProductCard slug="x-clean-4" />`
 * Ne touche qu'aux balises commençant par majuscule (composants MDX).
 */
function decodeEncodedJsx(content: string): string {
  return content.replace(
    /&lt;(\/?[A-Z][a-zA-Z0-9]*(?:\s+[^&]*?)?\/?)&gt;/g,
    (_m, inner) => `<${inner.replace(/&quot;/g, '"')}>`,
  )
}

/**
 * Étape 2 — Convertit la syntaxe raccourcie `[[product:slug]]` en JSX.
 */
function expandShorthand(content: string): string {
  return content.replace(
    /\[\[([a-z]+):([^\]\s]+)\]\]/g,
    (_m, alias, value) => {
      const component = resolveComponent(alias)
      const attr = component === 'ProductCarousel' ? 'slugs' : 'slug'
      return `<${component} ${attr}="${value}" />`
    },
  )
}

/**
 * Étape 3 — Convertit les shortcodes bloc `[[tip ...]]...[[/tip]]` en JSX.
 */
function expandBlockShortcodes(content: string): string {
  return content.replace(
    /\[\[([a-z]+)([^\]]*)\]\]([\s\S]*?)\[\[\/\1\]\]/g,
    (match, alias, attrs, body) => {
      if (!BLOCK_ALIASES.has(alias)) return match
      const component = resolveComponent(alias)
      const cleanAttrs = attrs.trim()
      const open = cleanAttrs ? `<${component} ${cleanAttrs}>` : `<${component}>`
      return `${open}\n${body.trim()}\n</${component}>`
    },
  )
}

/**
 * Étape 4 — Convertit les shortcodes inline auto-fermants `[[stat key="val" …]]`.
 * Doit tourner APRÈS `expandBlockShortcodes` pour ne pas manger les ouvertures.
 */
function expandInlineShortcodes(content: string): string {
  return content.replace(
    /\[\[([a-z]+)(\s+[^\]]*?)?\]\]/g,
    (match, alias, attrs) => {
      const lower = alias.toLowerCase()
      // Ignorer les raccourcis déjà gérés (product:slug) et les blocs
      if (BLOCK_ALIASES.has(lower)) return match
      if (!SHORTCODE_COMPONENTS[lower]) return match
      const component = resolveComponent(alias)
      const cleanAttrs = (attrs ?? '').trim()
      return cleanAttrs ? `<${component} ${cleanAttrs} />` : `<${component} />`
    },
  )
}

/**
 * Pipeline complet — à appliquer sur le contenu MDX brut avant compilation.
 */
export function processShortcodes(content: string): string {
  let out = decodeEncodedJsx(content)
  out = expandShorthand(out)
  out = expandBlockShortcodes(out)
  out = expandInlineShortcodes(out)
  return out
}

/**
 * Référence des shortcodes pour l'admin CMS — documentation + exemples.
 */
export interface ShortcodeDoc {
  alias: string
  component: string
  description: string
  example: string
  type: 'shorthand' | 'inline' | 'block'
}

export const SHORTCODE_DOCS: ShortcodeDoc[] = [
  {
    alias: 'product',
    component: 'ProductCard',
    description: 'Encart produit avec prix, note et lien affilié. Lu depuis content/products/{slug}.yaml.',
    example: '[[product:x-clean-4]]',
    type: 'shorthand',
  },
  {
    alias: 'carousel',
    component: 'ProductCarousel',
    description: 'Carrousel horizontal de produits — slugs séparés par des virgules. Scroll snap sur mobile.',
    example: '[[carousel:x-clean-4,x-plorer-75s,x-force-flex-14-60]]',
    type: 'shorthand',
  },
  {
    alias: 'cta',
    component: 'ProductCTA',
    description: 'Bouton d\'appel à l\'action pour un lien affilié (alternative à la conversion auto des liens markdown).',
    example: '[[cta name="Rowenta X-Clean 4" url="https://…" label="Voir sur rowenta.be"]]',
    type: 'inline',
  },
  {
    alias: 'stat',
    component: 'StatCard',
    description: 'Carte statistique mise en avant — valeur, libellé, sous-texte.',
    example: '[[stat value="45 min" label="Durée moyenne sur 80 m²" sub="Navigation LiDAR"]]',
    type: 'inline',
  },
  {
    alias: 'tldr',
    component: 'TLDRBox',
    description: 'Bloc TL;DR — items séparés par `---` et colonnes par `|`.',
    example: '[[tldr items="Meilleur rapport Q/P | X-Plorer 75 | 299 € --- Avec autovidage | Xiaomi X10+ | 449 €"]]',
    type: 'inline',
  },
  {
    alias: 'procon',
    component: 'ProConTable',
    description: 'Tableau points forts / points faibles — items séparés par `|`.',
    example: '[[procon pros="Prix contenu | 65 dB | 120 min d\'autonomie" cons="Pas de LiDAR | Bac 0,4 L"]]',
    type: 'inline',
  },
  {
    alias: 'summary',
    component: 'AISummarize',
    description: 'Résumé IA pour moteurs génératifs. Auto-injecté en haut de l\'article si absent.',
    example: '[[summary question="Quel robot choisir ?" points="Point 1 | Point 2 | Point 3"]]',
    type: 'inline',
  },
  {
    alias: 'tip',
    component: 'Tip',
    description: 'Encart conseil éditorial — voix maison « Le vrai tip ».',
    example: '[[tip title="Le vrai tip : autovidage ou pas ?"]]\nPour un ménage hebdomadaire, économisez les 150 €.\n[[/tip]]',
    type: 'block',
  },
  {
    alias: 'warning',
    component: 'Warning',
    description: 'Encart avertissement — mise à jour de prix, précaution, etc.',
    example: '[[warning title="Prix vérifiés en avril 2026"]]\nLes prix varient selon les promotions.\n[[/warning]]',
    type: 'block',
  },
  {
    alias: 'verdict',
    component: 'Verdict',
    description: 'Encart verdict éditorial — conclusion d\'une section produit.',
    example: '[[verdict title="Notre verdict X-Plorer 75"]]\nLe choix le plus simple à 299 €…\n[[/verdict]]',
    type: 'block',
  },
  {
    alias: 'pullquote',
    component: 'PullQuote',
    description: 'Citation mise en avant — typographie élégante.',
    example: '[[pullquote]]\nUn bon robot à 350 € fait 90 % du travail d\'un modèle à 900 €.\n[[/pullquote]]',
    type: 'block',
  },
]
