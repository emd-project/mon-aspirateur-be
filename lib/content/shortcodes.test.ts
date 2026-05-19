import { describe, it, expect } from 'vitest'
import { processShortcodes } from './shortcodes'
import { resolveVariables } from './variables'

describe('processShortcodes', () => {
  it('décode les JSX encodés en HTML par le WYSIWYG', () => {
    const input = 'Texte avant\n\n&lt;ProductCard slug="x-clean-4" /&gt;\n\nTexte après'
    const out = processShortcodes(input)
    expect(out).toContain('<ProductCard slug="x-clean-4" />')
    expect(out).not.toContain('&lt;')
  })

  it('convertit la syntaxe raccourcie [[product:slug]]', () => {
    const input = 'Avant\n\n[[product:x-clean-4]]\n\nAprès'
    const out = processShortcodes(input)
    expect(out).toContain('<ProductCard slug="x-clean-4" />')
  })

  it('convertit les shortcodes inline avec attributs [[stat …]]', () => {
    const input = '[[stat value="45 min" label="Durée" sub="LiDAR"]]'
    const out = processShortcodes(input)
    expect(out).toBe('<StatCard value="45 min" label="Durée" sub="LiDAR" />')
  })

  it('convertit les shortcodes bloc [[tip …]]…[[/tip]]', () => {
    const input = '[[tip title="Le vrai tip"]]\nContenu conseil.\n[[/tip]]'
    const out = processShortcodes(input)
    expect(out).toContain('<Tip title="Le vrai tip">')
    expect(out).toContain('Contenu conseil.')
    expect(out).toContain('</Tip>')
  })

  it('laisse passer les JSX natifs sans les toucher', () => {
    const input = '<ProductCard slug="dyson-v15" />'
    const out = processShortcodes(input)
    expect(out).toBe('<ProductCard slug="dyson-v15" />')
  })

  it('laisse les placeholders MDX_BLOCK intacts', () => {
    const input = '[[MDXBLOCK0]] et [[MDXBLOCK1]]'
    const out = processShortcodes(input)
    expect(out).toBe('[[MDXBLOCK0]] et [[MDXBLOCK1]]')
  })

  it('ignore les alias inconnus', () => {
    const input = '[[unknown attr="value"]]'
    const out = processShortcodes(input)
    expect(out).toBe('[[unknown attr="value"]]')
  })

  it('convertit [[carousel:slug1,slug2,slug3]] avec l\'attribut slugs', () => {
    const input = '[[carousel:x-clean-4,x-plorer-75s,x-force-flex-14-60]]'
    const out = processShortcodes(input)
    expect(out).toBe('<ProductCarousel slugs="x-clean-4,x-plorer-75s,x-force-flex-14-60" />')
  })

  it('résout [[var:price.slug]] en valeur formatée', () => {
    const out = processShortcodes('Le prix est [[var:price.dyson-v15-detect]].')
    expect(out).toBe('Le prix est 599 €.')
  })

  it('résout [[var:name.slug]] en nom produit', () => {
    const out = processShortcodes('[[var:name.dyson-v15-detect]]')
    expect(out).toBe('Dyson V15 Detect')
  })

  it('résout [[var:autonomy.slug]] avec unité', () => {
    const out = processShortcodes('[[var:autonomy.robot-a-lidar-349]]')
    expect(out).toBe('110 min')
  })

  it('laisse intact [[var:...]] si le slug est inconnu', () => {
    const out = processShortcodes('[[var:price.produit-inexistant]]')
    expect(out).toBe('[[var:price.produit-inexistant]]')
  })

  it('laisse intact [[var:...]] si le champ est inconnu', () => {
    const out = resolveVariables('[[var:couleur.dyson-v15-detect]]')
    expect(out).toBe('[[var:couleur.dyson-v15-detect]]')
  })

  it('résout plusieurs variables dans le même paragraphe', () => {
    const out = processShortcodes(
      'Le [[var:name.robot-a-lidar-349]] coûte [[var:price.robot-a-lidar-349]] avec [[var:autonomy.robot-a-lidar-349]] d\'autonomie.'
    )
    expect(out).toBe("Le RoboVac LiDAR Pro coûte 349 € avec 110 min d'autonomie.")
  })

  it('gère plusieurs shortcodes dans le même contenu', () => {
    const input = [
      '[[product:x-clean-4]]',
      '',
      '[[tip title="Astuce"]]',
      'Contenu.',
      '[[/tip]]',
      '',
      '[[stat value="50 m²" label="Surface"]]',
    ].join('\n')
    const out = processShortcodes(input)
    expect(out).toContain('<ProductCard slug="x-clean-4" />')
    expect(out).toContain('<Tip title="Astuce">')
    expect(out).toContain('<StatCard value="50 m²" label="Surface" />')
  })
})
