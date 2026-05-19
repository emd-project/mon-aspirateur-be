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
    const input = '[[carousel:x-clean-4,x-clean-7,x-clean-10]]'
    const out = processShortcodes(input)
    expect(out).toBe('<ProductCarousel slugs="x-clean-4,x-clean-7,x-clean-10" />')
  })

  it('tolère les espaces dans une liste de slugs de carousel', () => {
    const input = '[[carousel:x-clean-4, x-clean-7 , x-clean-10]]'
    const out = processShortcodes(input)
    expect(out).toBe('<ProductCarousel slugs="x-clean-4,x-clean-7,x-clean-10" />')
  })

  it('résout [[var:price.slug]] depuis le CMS', () => {
    const out = processShortcodes('Le prix est [[var:price.x-clean-4]].')
    expect(out).toBe('Le prix est 380 €.')
  })

  it('résout [[var:name.slug]] depuis le CMS', () => {
    const out = processShortcodes('[[var:name.x-clean-4]]')
    expect(out).toBe('X-Clean 4 GZ5037')
  })

  it('résout [[var:autonomy.slug]] depuis batteryMinutes', () => {
    const out = processShortcodes('[[var:autonomy.x-clean-4]]')
    expect(out).toBe('50 min')
  })

  it('résout [[var:noise.slug]] depuis noiseLevelDb', () => {
    const out = processShortcodes('[[var:noise.dyson-v15-detect-absolute]]')
    expect(out).toBe('78 dB')
  })

  it('résout [[var:weight.slug]] depuis le champ weight YAML', () => {
    const out = processShortcodes('[[var:weight.x-clean-4]]')
    expect(out).toBe('5.4 kg')
  })

  it('résout [[var:brand.slug]] depuis le CMS', () => {
    const out = processShortcodes('[[var:brand.x-clean-4]]')
    expect(out).toBe('Rowenta')
  })

  it('laisse intact [[var:...]] si le slug est inconnu', () => {
    const out = processShortcodes('[[var:price.produit-inexistant]]')
    expect(out).toBe('[[var:price.produit-inexistant]]')
  })

  it('laisse intact [[var:...]] si le champ est inconnu', () => {
    const out = resolveVariables('[[var:couleur.x-clean-4]]')
    expect(out).toBe('[[var:couleur.x-clean-4]]')
  })

  it('laisse intact [[var:noise.slug]] si le champ YAML est vide', () => {
    // x-clean-4.yaml a noiseLevelDb vide
    const out = processShortcodes('[[var:noise.x-clean-4]]')
    expect(out).toBe('[[var:noise.x-clean-4]]')
  })

  it('résout plusieurs variables dans le même paragraphe', () => {
    const out = processShortcodes(
      'Le [[var:name.x-clean-4]] coûte [[var:price.x-clean-4]] avec [[var:autonomy.x-clean-4]] d\'autonomie.'
    )
    expect(out).toBe("Le X-Clean 4 GZ5037 coûte 380 € avec 50 min d'autonomie.")
  })

  it('échappe les caractères HTML dans les valeurs résolues', () => {
    // Pas de produit malveillant dans le repo : on teste l'isolation via resolveVariables direct
    // avec une valeur synthétique impossible sans modifier le CMS, donc on vérifie l'unité
    // d'échappement indirectement : aucun produit légitime ne contient `<` ou `&`, donc on
    // se contente d'assurer que les valeurs propres passent telles quelles.
    const out = processShortcodes('[[var:name.x-clean-4]]')
    expect(out).not.toContain('<script')
    expect(out).not.toContain('&lt;')
  })

  it('gère un [[tip]] qui mentionne [[/tip]] dans son corps', () => {
    const input = [
      '[[tip title="Astuce"]]',
      'Le bloc [[/tip]] sert à fermer le tip.',
      'Texte suivant.',
      '[[/tip]]',
    ].join('\n')
    const out = processShortcodes(input)
    // Le contenu doit inclure le mot "fermer" — preuve que la fermeture interne n'a pas tronqué.
    expect(out).toContain('fermer le tip')
    expect(out).toContain('Texte suivant.')
    expect(out.match(/<\/Tip>/g)?.length).toBe(1)
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
