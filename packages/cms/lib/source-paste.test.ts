import { describe, it, expect } from 'vitest'
import { tabbedTextToGfm } from './source-paste'

describe('tabbedTextToGfm', () => {
  it('returns null when the text has no tabulation', () => {
    expect(tabbedTextToGfm('Just plain text')).toBeNull()
    expect(tabbedTextToGfm('Line one\nLine two')).toBeNull()
  })

  it('converts a tab-separated paste into a GFM table', () => {
    const text = 'Modèle\tMarque\tAutonomie\nX-Clean 4\tRowenta\t50 min\nX-Clean 2\tRowenta\t35 min'
    const gfm = tabbedTextToGfm(text)
    expect(gfm).toContain('| Modèle | Marque | Autonomie |')
    expect(gfm).toContain('| --- | --- | --- |')
    expect(gfm).toContain('| X-Clean 4 | Rowenta | 50 min |')
    expect(gfm).toContain('| X-Clean 2 | Rowenta | 35 min |')
  })

  it('escapes pipes inside cells', () => {
    const text = 'Col A\tCol B\nv1 | v2\tplain'
    const gfm = tabbedTextToGfm(text) ?? ''
    expect(gfm).toContain('| v1 \\| v2 | plain |')
  })

  it('pads short rows to the longest row', () => {
    const text = 'A\tB\tC\n1\t2'
    const gfm = tabbedTextToGfm(text) ?? ''
    expect(gfm).toContain('| A | B | C |')
    expect(gfm).toContain('| 1 | 2 |  |')
  })

  it('returns null when only one column is detected', () => {
    expect(tabbedTextToGfm('only-one-cell')).toBeNull()
  })

  it('handles \\r\\n line endings (Windows clipboard)', () => {
    const text = 'A\tB\r\n1\t2\r\n3\t4'
    const gfm = tabbedTextToGfm(text) ?? ''
    expect(gfm).toContain('| A | B |')
    expect(gfm).toContain('| 1 | 2 |')
    expect(gfm).toContain('| 3 | 4 |')
  })
})
