import { describe, it, expect } from 'vitest'
import { normalizeMdxWhitespace } from './normalize'

describe('normalizeMdxWhitespace', () => {
  it('supprime les &nbsp; HTML', () => {
    expect(normalizeMdxWhitespace('chez vous&nbsp;!')).toBe('chez vous !')
  })

  it('supprime les insécables Unicode U+00A0', () => {
    const nbsp = String.fromCharCode(0x00a0)
    expect(normalizeMdxWhitespace(`chez vous${nbsp}!`)).toBe('chez vous !')
  })

  it('supprime les entités numériques &#160; et &#xA0;', () => {
    expect(normalizeMdxWhitespace('a&#160;b&#xA0;c')).toBe('a b c')
  })

  it('réduit les suites d’espaces en un seul', () => {
    expect(normalizeMdxWhitespace('mot   suivant')).toBe('mot suivant')
  })

  it('retire les espaces traînants en fin de ligne', () => {
    expect(normalizeMdxWhitespace('ligne   \nautre')).toBe('ligne\nautre')
  })

  it('préserve les retours à la ligne (paragraphes)', () => {
    expect(normalizeMdxWhitespace('a\n\nb')).toBe('a\n\nb')
  })

  it('nettoie un cas réel d’import Google Docs', () => {
    expect(normalizeMdxWhitespace('un vrai aspirateur laveur&nbsp;!&nbsp;')).toBe(
      'un vrai aspirateur laveur !',
    )
  })
})
