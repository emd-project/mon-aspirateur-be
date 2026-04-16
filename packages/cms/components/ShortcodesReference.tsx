'use client'

import { useState } from 'react'
import type { ShortcodeDoc } from '@/lib/content/shortcodes'

const C = {
  surface: '#FFFFFF',
  surface2: '#F0EBE3',
  border: '#EDE5D8',
  text: '#1A1714',
  muted: '#6B5E54',
  dim: '#9C8E84',
  accent: '#C4622D',
  accentSoft: 'rgba(196,98,45,.08)',
  accentBorder: 'rgba(196,98,45,.2)',
  success: '#6B8F71',
  successBorder: 'rgba(107,143,113,.3)',
}

const TYPE_LABELS: Record<ShortcodeDoc['type'], string> = {
  shorthand: 'Raccourci',
  inline: 'Inline',
  block: 'Bloc',
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    void navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={copy}
      style={{
        padding: '0.375rem 0.75rem',
        background: copied ? C.accentSoft : C.surface2,
        border: `1px solid ${copied ? C.successBorder : C.border}`,
        borderRadius: 7,
        color: copied ? C.success : C.muted,
        fontSize: '0.75rem',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        fontWeight: 500,
        fontFamily: 'inherit',
      }}
    >
      {copied ? 'Copié ✓' : 'Copier'}
    </button>
  )
}

export function ShortcodesReference({ docs }: { docs: ShortcodeDoc[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ padding: '1rem 1.125rem', background: C.accentSoft, border: `1px solid ${C.accentBorder}`, borderRadius: 10, color: C.text }}>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
          Nouvelle syntaxe — plus simple, pas de bugs d&apos;intégration
        </p>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: C.muted, lineHeight: 1.6 }}>
          Les shortcodes <code style={{ background: C.surface, padding: '1px 5px', borderRadius: 4, fontSize: '0.75rem' }}>[[…]]</code> sont à coller directement dans le corps de l&apos;article.
          Ils traversent le mode WYSIWYG sans être cassés par l&apos;éditeur — contrairement aux balises JSX <code style={{ background: C.surface, padding: '1px 5px', borderRadius: 4, fontSize: '0.75rem' }}>&lt;Component /&gt;</code> qui étaient parfois encodées en HTML et apparaissaient comme du texte brut dans l&apos;article final.
        </p>
      </div>

      {docs.map((doc) => (
        <article
          key={doc.alias}
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: '1.125rem 1.25rem',
          }}
        >
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.625rem', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', color: C.text, letterSpacing: '-0.01em' }}>
                <code style={{ fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: '0.875rem', color: C.accent, fontWeight: 600 }}>
                  [[{doc.alias}]]
                </code>
                <span style={{ color: C.dim, fontWeight: 400, fontSize: '0.8125rem', marginLeft: '0.5rem' }}>
                  → &lt;{doc.component}&gt;
                </span>
              </h3>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: C.muted, lineHeight: 1.5 }}>
                {doc.description}
              </p>
            </div>
            <span style={{
              padding: '2px 8px',
              borderRadius: 12,
              background: C.surface2,
              border: `1px solid ${C.border}`,
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: C.muted,
              letterSpacing: '.04em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}>
              {TYPE_LABELS[doc.type]}
            </span>
          </header>

          <div style={{ display: 'flex', alignItems: 'stretch', gap: '0.5rem', marginTop: '0.75rem' }}>
            <pre style={{
              flex: 1,
              margin: 0,
              padding: '0.625rem 0.875rem',
              background: C.surface2,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontFamily: 'JetBrains Mono, Consolas, monospace',
              fontSize: '0.8125rem',
              color: C.text,
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.5,
            }}>
              {doc.example}
            </pre>
            <CopyButton text={doc.example} />
          </div>
        </article>
      ))}

      <div style={{ padding: '0.875rem 1rem', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: '0.8125rem', color: C.muted, lineHeight: 1.6 }}>
        <strong style={{ color: C.text }}>Bon à savoir</strong> — les anciennes balises JSX <code style={{ background: C.surface, padding: '1px 5px', borderRadius: 4, fontSize: '0.75rem' }}>&lt;ProductCard slug=&quot;…&quot; /&gt;</code> continuent de fonctionner.
        Le moteur de rendu décode aussi automatiquement les balises encodées en HTML par l&apos;éditeur. Utilisez la nouvelle syntaxe pour les nouveaux articles.
      </div>
    </div>
  )
}
