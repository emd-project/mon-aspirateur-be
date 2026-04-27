import { describe, it, expect } from 'vitest'
import { extractFaqFromBody, stripFaqSection } from './faq-extract'

describe('extractFaqFromBody', () => {
  it('returns empty when no ## FAQ section is present', () => {
    expect(extractFaqFromBody('## Intro\n\nTexte\n\n## Conclusion\n')).toEqual([])
  })

  it('extracts ### question + paragraph answer pairs', () => {
    const md = [
      '## FAQ',
      '',
      '### Combien de minutes d’autonomie ?',
      '',
      'Environ 35 minutes en mode standard.',
      '',
      '### Le X-Clean est-il bruyant ?',
      '',
      'Mesuré à 65 dB, il reste utilisable devant la TV.',
    ].join('\n')
    const faq = extractFaqFromBody(md)
    expect(faq).toHaveLength(2)
    expect(faq[0]?.question).toBe('Combien de minutes d’autonomie ?')
    expect(faq[0]?.answer).toBe('Environ 35 minutes en mode standard.')
    expect(faq[1]?.question).toBe('Le X-Clean est-il bruyant ?')
  })

  it('extracts **Question ?** paragraph + paragraph answer pairs', () => {
    const md = [
      '## FAQ',
      '',
      '**Quelle est la différence entre un aspirateur laveur et un balai ?**',
      '',
      'Un aspirateur laveur dispose de deux réservoirs distincts.',
      '',
      '---',
      '',
      '**35 minutes d’autonomie, c’est suffisant pour un appartement ?**',
      '',
      'Pour un studio ou un appartement de deux pièces, oui.',
    ].join('\n')
    const faq = extractFaqFromBody(md)
    expect(faq).toHaveLength(2)
    expect(faq[0]?.question).toBe(
      'Quelle est la différence entre un aspirateur laveur et un balai ?',
    )
    expect(faq[0]?.answer).toBe('Un aspirateur laveur dispose de deux réservoirs distincts.')
    expect(faq[1]?.question).toBe(
      '35 minutes d’autonomie, c’est suffisant pour un appartement ?',
    )
  })

  it('stops at the next ## heading', () => {
    const md = [
      '## FAQ',
      '',
      '### Q1 ?',
      '',
      'A1.',
      '',
      '## Conclusion',
      '',
      '### Q2 ?',
      '',
      'A2.',
    ].join('\n')
    const faq = extractFaqFromBody(md)
    expect(faq).toHaveLength(1)
    expect(faq[0]?.question).toBe('Q1 ?')
  })

  it('ignores --- separators between pairs', () => {
    const md = [
      '## FAQ',
      '',
      '**Q1 ?**',
      '',
      'A1.',
      '',
      '---',
      '',
      '**Q2 ?**',
      '',
      'A2.',
    ].join('\n')
    expect(extractFaqFromBody(md)).toHaveLength(2)
  })

  it('does not treat plain bold paragraphs as questions when missing a ?', () => {
    const md = [
      '## FAQ',
      '',
      '**Notre verdict final**',
      '',
      'Très bon produit.',
    ].join('\n')
    expect(extractFaqFromBody(md)).toEqual([])
  })

  it('handles answers that span multiple lines (joined paragraph)', () => {
    const md = [
      '## FAQ',
      '',
      '### Quelle est la différence ?',
      '',
      'Première phrase de la réponse.',
      'Deuxième ligne dans le même paragraphe.',
    ].join('\n')
    const faq = extractFaqFromBody(md)
    expect(faq).toHaveLength(1)
    expect(faq[0]?.answer).toContain('Première phrase')
    expect(faq[0]?.answer).toContain('Deuxième ligne')
  })
})

describe('stripFaqSection', () => {
  it('removes the entire ## FAQ section including heading', () => {
    const md = [
      '## Intro',
      '',
      'Avant la FAQ.',
      '',
      '## FAQ',
      '',
      '**Q ?**',
      '',
      'A.',
      '',
      '## Conclusion',
      '',
      'Après la FAQ.',
    ].join('\n')
    const out = stripFaqSection(md)
    expect(out).not.toContain('## FAQ')
    expect(out).not.toContain('**Q ?**')
    expect(out).toContain('## Intro')
    expect(out).toContain('## Conclusion')
    expect(out).toContain('Après la FAQ.')
  })

  it('removes the FAQ when it is the last section', () => {
    const md = [
      '## Intro',
      '',
      'Texte.',
      '',
      '## FAQ',
      '',
      '### Q ?',
      '',
      'A.',
    ].join('\n')
    const out = stripFaqSection(md)
    expect(out).not.toContain('## FAQ')
    expect(out).not.toContain('### Q ?')
    expect(out).toContain('## Intro')
  })

  it('returns the content unchanged when no FAQ section', () => {
    const md = '## Intro\n\nTexte.\n\n## Conclusion\n'
    expect(stripFaqSection(md)).toBe(md)
  })
})
