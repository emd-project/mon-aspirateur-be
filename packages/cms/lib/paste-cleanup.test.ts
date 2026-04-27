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
    expect(cleanPastedHTML(html)).toContain('<p>Inner</p>')
    expect(cleanPastedHTML(html)).not.toContain('docs-internal-guid')
  })

  it('normalises <b>/<i> to <strong>/<em>', () => {
    const html = '<b>Bold</b> and <i>italic</i>'
    const out = cleanPastedHTML(html)
    expect(out).toContain('<strong>Bold</strong>')
    expect(out).toContain('<em>italic</em>')
  })

  it('converts a Google Docs table to a GFM-in-paragraph block', () => {
    const html =
      '<table>' +
      '<tr><td><p>Modèle</p></td><td><p>Prix</p></td></tr>' +
      '<tr><td><p>X-Clean 4</p></td><td><p>~250&nbsp;€</p></td></tr>' +
      '<tr><td><p>X-Clean 2</p></td><td><p>~200 €</p></td></tr>' +
      '</table>'
    const cleaned = cleanPastedHTML(html)
    // Sanity : la balise <table> a disparu, remplacée par un <p> avec <br>
    expect(cleaned).not.toContain('<table')
    expect(cleaned).toMatch(/<p>\| Modèle \| Prix \|/)
    expect(cleaned).toContain('<br>| --- | --- |')
    expect(cleaned).toContain('| X-Clean 4 | ~250 € |')
    expect(cleaned).toContain('| X-Clean 2 | ~200 € |')
  })

  it('round-trips a pasted table through htmlToMarkdown into valid GFM', () => {
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

  it('escapes raw pipes inside cells so they do not break GFM', () => {
    const html = '<table><tr><td>A | B</td><td>C</td></tr><tr><td>1</td><td>2</td></tr></table>'
    const md = htmlToMarkdown(cleanPastedHTML(html))
    expect(md).toContain('| A \\| B | C |')
    expect(md).toContain('| 1 | 2 |')
  })

  it('handles a table with <th> as the header row', () => {
    const html =
      '<table>' +
      '<thead><tr><th>Col1</th><th>Col2</th></tr></thead>' +
      '<tbody><tr><td>a</td><td>b</td></tr></tbody>' +
      '</table>'
    const md = htmlToMarkdown(cleanPastedHTML(html))
    expect(md).toContain('| Col1 | Col2 |')
    expect(md).toContain('| --- | --- |')
    expect(md).toContain('| a | b |')
  })

  it('strips Google Docs nested span/style noise inside cells', () => {
    const html =
      '<table><tr>' +
      '<td><p><span style="font-weight:700">Modèle</span></p></td>' +
      '<td><p><span style="font-style:italic">Prix</span></p></td>' +
      '</tr><tr>' +
      '<td><p>X-Clean 4</p></td><td><p>250 €</p></td>' +
      '</tr></table>'
    const md = htmlToMarkdown(cleanPastedHTML(html))
    expect(md).toContain('| Modèle | Prix |')
    expect(md).toContain('| X-Clean 4 | 250 € |')
  })
})
