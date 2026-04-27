'use client'

import type { RefObject, ClipboardEvent } from 'react'
import { WysiwygEditor, type WysiwygEditorRef } from './WysiwygEditor'
import { C, inputStyle } from './editor-tokens'
import { EditorSection } from './EditorSection'
import { tabbedTextToGfm } from '../lib/source-paste'
import { htmlToMarkdown } from '../lib/html-md'
import { cleanPastedHTML } from '../lib/paste-cleanup'

interface Props {
  bodyMode: 'wysiwyg' | 'source'
  onSwitchToWysiwyg: () => void
  onSwitchToSource: () => void
  sourceBody: string
  onSourceChange: (v: string) => void
  mdxBlocks: Record<string, string>
  wysiwygHtml: string
  onWysiwygChange: (v: string) => void
  editorRef: RefObject<WysiwygEditorRef | null>
}

export function EditorBody({ bodyMode, onSwitchToWysiwyg, onSwitchToSource, sourceBody, onSourceChange, mdxBlocks, wysiwygHtml, onWysiwygChange, editorRef }: Props) {
  const mdxCount = Object.keys(mdxBlocks).length

  // En mode Source, on intercepte le paste pour convertir un tableau Google Docs
  // (HTML <table> ou texte tab-séparé) en GFM markdown au moment de l'insertion.
  function handleSourcePaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    const html = e.clipboardData.getData('text/html')
    const plain = e.clipboardData.getData('text/plain')

    let replacement: string | null = null
    if (html && /<table\b/i.test(html)) {
      // HTML disponible avec un tableau → on passe par cleanPastedHTML + htmlToMarkdown
      replacement = htmlToMarkdown(cleanPastedHTML(html))
    } else if (plain && plain.includes('\t')) {
      // Plain text tab-séparé → conversion directe en GFM
      replacement = tabbedTextToGfm(plain)
    }
    if (!replacement) return // comportement standard (paste plain)

    e.preventDefault()
    const target = e.currentTarget
    const start = target.selectionStart ?? sourceBody.length
    const end = target.selectionEnd ?? sourceBody.length
    const next = sourceBody.slice(0, start) + replacement + sourceBody.slice(end)
    onSourceChange(next)
    // Replacer le caret après l'insertion
    requestAnimationFrame(() => {
      target.selectionStart = target.selectionEnd = start + replacement.length
    })
  }

  return (
    <EditorSection title="Corps de l&#39;article" defaultOpen>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/admin/shortcodes" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: C.accent, textDecoration: 'none', fontWeight: 500 }}>Voir les shortcodes</a>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['wysiwyg', 'source'] as const).map((mode) => (
            <button key={mode} type="button" onClick={mode === 'wysiwyg' ? onSwitchToWysiwyg : onSwitchToSource} style={{ padding: '0.3125rem 0.625rem', borderRadius: 7, border: `1px solid ${bodyMode === mode ? C.accentBorder : C.border}`, background: bodyMode === mode ? C.accentSoft : 'transparent', color: bodyMode === mode ? C.accent : C.muted, fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500 }}>
              {mode === 'wysiwyg' ? 'WYSIWYG' : 'Source MDX'}
            </button>
          ))}
        </div>
      </div>
      {bodyMode === 'wysiwyg' ? (
        <>
          {mdxCount > 0 && <div style={{ padding: '0.5rem 0.75rem', background: C.warningSoft, border: `1px solid ${C.warningBorder}`, borderRadius: 8, fontSize: '0.8125rem', color: C.warning }}>{mdxCount} composant(s) MDX préservé(s) — passez en Source pour les modifier.</div>}
          <WysiwygEditor ref={editorRef} initialHTML={wysiwygHtml} onChange={onWysiwygChange} placeholder="Rédigez le contenu ici…" />
        </>
      ) : (
        <textarea value={sourceBody} onChange={(e) => onSourceChange(e.target.value)} onPaste={handleSourcePaste} rows={24} spellCheck={false} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: '0.8125rem', lineHeight: 1.6, tabSize: 2 }} placeholder="MDX source…" />
      )}
    </EditorSection>
  )
}
