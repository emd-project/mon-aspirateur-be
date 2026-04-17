'use client'

import type { RefObject } from 'react'
import { WysiwygEditor, type WysiwygEditorRef } from './WysiwygEditor'
import { C, inputStyle } from './editor-tokens'
import { EditorSection } from './EditorSection'

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
        <textarea value={sourceBody} onChange={(e) => onSourceChange(e.target.value)} rows={24} spellCheck={false} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: '0.8125rem', lineHeight: 1.6, tabSize: 2 }} placeholder="MDX source…" />
      )}
    </EditorSection>
  )
}
