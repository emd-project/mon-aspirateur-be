import { describe, it, expect } from 'vitest'
import { autoProductCTA } from './auto-cta'

describe('autoProductCTA', () => {
  it('convertit un lien « Voir … sur <domaine> » isolé en <ProductCTA>', () => {
    const out = autoProductCTA('[Voir le Rowenta X-Clean 10 sur rowenta.be](#)')
    expect(out).toContain('<ProductCTA')
    expect(out).toContain('name="Rowenta X-Clean 10"')
    expect(out).toContain('label="Voir sur rowenta.be"')
    expect(out).toContain('url="#"')
  })

  it('convertit un lien sans « sur domaine » en dérivant le domaine de l’URL', () => {
    const out = autoProductCTA(
      '[Voir le Rowenta X-Clean 2](https://www.rowenta.be/fr/p/x-clean-2/2211401416)',
    )
    expect(out).toContain('name="Rowenta X-Clean 2"')
    expect(out).toContain('label="Voir sur rowenta.be"')
  })

  it('dérive le domaine d’une URL Amazon', () => {
    const out = autoProductCTA('[Voir le Dreame H12 Pro](https://www.amazon.fr/Dreame/dp/B0BJ)')
    expect(out).toContain('name="Dreame H12 Pro"')
    expect(out).toContain('label="Voir sur amazon.fr"')
  })

  it('retombe sur « Voir l’offre » quand l’URL est un placeholder #', () => {
    const out = autoProductCTA('[Voir le Bissell CrossWave](#)')
    expect(out).toContain('name="Bissell CrossWave"')
    expect(out).toContain('label="Voir l\'offre"')
  })

  it('ne touche pas un lien dans une cellule de tableau', () => {
    const row = '| X-Clean 2 | [Voir le X-Clean 2](https://x.be) |'
    expect(autoProductCTA(row)).toBe(row)
  })

  it('ne touche pas un lien en milieu de phrase', () => {
    const s = 'Pour comparer, [Voir le X-Clean 7 sur rowenta.be](#) puis décidez.'
    expect(autoProductCTA(s)).toBe(s)
  })

  it('échappe les guillemets dans le nom du produit', () => {
    const out = autoProductCTA('[Voir le Pack "Maison" sur rowenta.be](#)')
    expect(out).toContain('name="Pack &quot;Maison&quot;"')
  })
})
