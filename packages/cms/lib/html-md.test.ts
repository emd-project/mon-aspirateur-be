import { describe, it, expect } from 'vitest'
import { extractMdxBlocks, reinsertMdxBlocks, markdownToHtml, htmlToMarkdown } from './html-md'

describe('extractMdxBlocks', () => {
  it('extracts JSX self-closing blocks', () => {
    const md = 'Text before\n\n<ProductCard slug="x" />\n\nText after'
    const { cleaned, blocks } = extractMdxBlocks(md)
    expect(cleaned).toContain('[[MDXBLOCK0]]')
    expect(cleaned).not.toContain('<ProductCard')
    expect(blocks['MDXBLOCK0']).toBe('<ProductCard slug="x" />')
  })

  it('extracts GFM tables as preserved blocks', () => {
    const md = [
      'Intro text',
      '',
      '| Model | Price |',
      '| --- | --- |',
      '| X-Clean 4 | 249 € |',
      '| X-Clean 2 | 199 € |',
      '',
      'After table',
    ].join('\n')
    const { cleaned, blocks } = extractMdxBlocks(md)
    expect(cleaned).toContain('[[MDXBLOCK0]]')
    expect(cleaned).not.toContain('| Model')
    const block = blocks['MDXBLOCK0'] ?? ''
    expect(block).toContain('| Model | Price |')
    expect(block).toContain('| X-Clean 4 | 249 € |')
  })

  it('extracts shortcode blocks [[tip …]]…[[/tip]]', () => {
    const md = 'Before\n\n[[tip title="Le vrai tip"]]\nContent here.\n[[/tip]]\n\nAfter'
    const { cleaned, blocks } = extractMdxBlocks(md)
    expect(cleaned).toContain('[[MDXBLOCK0]]')
    const block = blocks['MDXBLOCK0'] ?? ''
    expect(block).toContain('[[tip title="Le vrai tip"]]')
    expect(block).toContain('[[/tip]]')
  })

  it('extracts inline shortcodes [[product:slug]]', () => {
    const md = 'Some text\n\n[[product:x-clean-4]]\n\nMore text'
    const { cleaned, blocks } = extractMdxBlocks(md)
    expect(cleaned).toContain('[[MDXBLOCK0]]')
    expect(blocks['MDXBLOCK0']).toBe('[[product:x-clean-4]]')
  })

  it('does not extract MDX_BLOCK placeholders themselves', () => {
    const md = '[[MDXBLOCK0]] text [[MDXBLOCK1]]'
    const { cleaned, blocks } = extractMdxBlocks(md)
    expect(Object.keys(blocks)).toHaveLength(0)
    expect(cleaned).toBe(md)
  })
})

describe('reinsertMdxBlocks', () => {
  it('reinserts blocks into placeholders', () => {
    const md = 'Text\n\n[[MDXBLOCK0]]\n\nMore'
    const blocks = { MDXBLOCK0: '| A | B |\n| --- | --- |\n| 1 | 2 |' }
    const result = reinsertMdxBlocks(md, blocks)
    expect(result).toContain('| A | B |')
    expect(result).not.toContain('[[MDXBLOCK0]]')
  })
})

describe('markdownToHtml — tables', () => {
  it('converts a GFM table to HTML table', () => {
    const md = [
      '| Name | Price |',
      '| --- | --- |',
      '| Dyson | 499 |',
    ].join('\n')
    const html = markdownToHtml(md)
    expect(html).toContain('<table>')
    expect(html).toContain('<th>Name</th>')
    expect(html).toContain('<th>Price</th>')
    expect(html).toContain('<td>Dyson</td>')
    expect(html).toContain('<td>499</td>')
  })
})

describe('htmlToMarkdown — tables', () => {
  it('converts an HTML table back to GFM', () => {
    const html = '<table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>'
    const md = htmlToMarkdown(html)
    expect(md).toContain('| A | B |')
    expect(md).toContain('| --- | --- |')
    expect(md).toContain('| 1 | 2 |')
  })
})

describe('table round-trip', () => {
  it('GFM → extract → reinsert preserves table verbatim', () => {
    const original = [
      'Introduction.',
      '',
      '| Model | Autonomie | Prix |',
      '| --- | --- | --- |',
      '| X-Clean 4 | 50 min | ~250 € |',
      '| X-Clean 2 | 35 min | ~200 € |',
      '',
      'Conclusion.',
    ].join('\n')

    const { cleaned, blocks } = extractMdxBlocks(original)
    const html = markdownToHtml(cleaned)
    const backMd = htmlToMarkdown(html)
    const final = reinsertMdxBlocks(backMd, blocks)

    expect(final).toContain('| Model | Autonomie | Prix |')
    expect(final).toContain('| X-Clean 4 | 50 min | ~250 € |')
    expect(final).toContain('Introduction.')
    expect(final).toContain('Conclusion.')
  })

  it('HTML table → GFM → HTML round-trip preserves data', () => {
    const html = '<table><thead><tr><th>Col1</th><th>Col2</th></tr></thead><tbody><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>'
    const md = htmlToMarkdown(html)
    expect(md).toContain('| Col1 | Col2 |')
    const backHtml = markdownToHtml(md)
    expect(backHtml).toContain('<th>Col1</th>')
    expect(backHtml).toContain('<td>a</td>')
    expect(backHtml).toContain('<td>d</td>')
  })
})
