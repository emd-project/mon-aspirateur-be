import { describe, it, expect } from 'vitest'
import { cleanPastedHTML } from './paste-cleanup'
import { htmlToMarkdown } from './html-md'

describe('cleanPastedHTML', () => {
  it('returns plain strings untouched', () => {
    expect(cleanPastedHTML('Hello world')).toBe('Hello world')
  })

  it('strips Google Docs <style> blocks', () => {
    const html = '<style>.c1 { color: red; }</style><p>Texte</p>'
    expect(cleanPastedHTML(html)).toBe('<p>Texte</p>')
  })

  it('strips <meta> tags and HTML comments', () => {
    const html = '<meta charset="utf-8"><!-- StartFragment --><p>Texte</p><!-- EndFragment -->'
    expect(cleanPastedHTML(html)).toBe('<p>Texte</p>')
  })

  it('unwraps Google Docs docs-internal-guid <b>', () => {
    const html = '<b id="docs-internal-guid-abc-123" style="font-weight:normal"><p>Inner</p></b>'
    const out = cleanPastedHTML(html)
    expect(out).toContain('<p>Inner</p>')
    expect(out).not.toContain('docs-internal-guid')
  })

  it('normalises <b>/<i> to <strong>/<em> outside tables', () => {
    const html = '<b>Bold</b> and <i>italic</i>'
    const out = cleanPastedHTML(html)
    expect(out).toContain('<strong>Bold</strong>')
    expect(out).toContain('<em>italic</em>')
  })

  it('preserves the <table> structure for native TipTap rendering', () => {
    const html =
      '<table>' +
      '<tr><td><p>Modèle</p></td><td><p>Prix</p></td></tr>' +
      '<tr><td><p>X-Clean 4</p></td><td><p>~250&nbsp;€</p></td></tr>' +
      '<tr><td><p>X-Clean 2</p></td><td><p>~200 €</p></td></tr>' +
      '</table>'
    const cleaned = cleanPastedHTML(html)
    expect(cleaned).toContain('<table>')
    expect(cleaned).toContain('<tr>')
    expect(cleaned).toContain('<td>Modèle</td>')
    expect(cleaned).toContain('<td>X-Clean 4</td>')
    // Les <p> imbriqués dans les cellules doivent être déballés
    expect(cleaned).not.toMatch(/<td><p>/)
  })

  it('strips style/class/id attributes from table cells', () => {
    const html =
      '<table style="border-collapse:collapse" class="docs-table">' +
      '<tr style="height:21px"><td style="padding:5px" id="cell-1" class="c2">Cell A</td><td>Cell B</td></tr>' +
      '</table>'
    const out = cleanPastedHTML(html)
    expect(out).not.toMatch(/style="/)
    expect(out).not.toMatch(/<td\b[^>]*id="/)
    expect(out).toContain('<td>Cell A</td>')
    expect(out).toContain('<td>Cell B</td>')
  })

  it('round-trips a cleaned table through htmlToMarkdown into valid GFM', () => {
    const html =
      '<table>' +
      '<tr><td>Modèle</td><td>Autonomie</td><td>Prix</td></tr>' +
      '<tr><td>X-Clean 4</td><td>50 min</td><td>~250 €</td></tr>' +
      '<tr><td>X-Clean 2</td><td>35 min</td><td>~200 €</td></tr>' +
      '</table>'
    const md = htmlToMarkdown(cleanPastedHTML(html))
    expect(md).toContain('| Modèle | Autonomie | Prix |')
    expect(md).toContain('| --- | --- | --- |')
    expect(md).toContain('| X-Clean 4 | 50 min | ~250 € |')
    expect(md).toContain('| X-Clean 2 | 35 min | ~200 € |')
  })

  it('handles a table with <th> as the header row', () => {
    const html =
      '<table>' +
      '<thead><tr><th>Col1</th><th>Col2</th></tr></thead>' +
      '<tbody><tr><td>a</td><td>b</td></tr></tbody>' +
      '</table>'
    const out = cleanPastedHTML(html)
    expect(out).toContain('<th>Col1</th>')
    expect(out).toContain('<td>a</td>')
  })

  it('strips Google Docs nested span/style noise inside cells', () => {
    const html =
      '<table><tr>' +
      '<td><p><span style="font-weight:700">Modèle</span></p></td>' +
      '<td><p><span style="font-style:italic">Prix</span></p></td>' +
      '</tr><tr>' +
      '<td><p>X-Clean 4</p></td><td><p>250 €</p></td>' +
      '</tr></table>'
    const out = cleanPastedHTML(html)
    expect(out).toContain('<td>Modèle</td>')
    expect(out).toContain('<td>Prix</td>')
    expect(out).toContain('<td>X-Clean 4</td>')
    expect(out).toContain('<td>250 €</td>')
  })

  it('strips colgroup blocks injected by Google Docs', () => {
    const html =
      '<table>' +
      '<colgroup><col width="100"><col width="200"></colgroup>' +
      '<tr><td>a</td><td>b</td></tr>' +
      '</table>'
    const out = cleanPastedHTML(html)
    expect(out).not.toContain('<colgroup')
    expect(out).not.toContain('<col ')
    expect(out).toContain('<td>a</td>')
  })

  it('convertit les espaces insécables (&nbsp; et U+00A0) en espace normal', () => {
    const nbsp = String.fromCharCode(0x00a0)
    const out = cleanPastedHTML(`<p>Sous 200&nbsp;€, le X-Clean 2${nbsp}!</p>`)
    expect(out).not.toContain('&nbsp;')
    expect(out).not.toContain(nbsp)
    expect(out).toContain('Sous 200 €, le X-Clean 2 !')
  })
})
