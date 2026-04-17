'use client'

import { C } from './editor-tokens'

interface Props {
  entrySlug?: string
  dirty: boolean
  hasPending: boolean
  saving: boolean
  isMdx: boolean
  isReadOnly: boolean
  shortcode?: string
  shortcodeCopied: boolean
  onSave: () => void
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void
  onCopyShortcode: () => void
}

export function EditorHeader({ entrySlug, dirty, hasPending, saving, isMdx, isReadOnly, shortcode, shortcodeCopied, onSave, onImport, onCopyShortcode }: Props) {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 10, background: C.bg, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.875rem', color: C.muted }}>{entrySlug ? `Modifier — ${entrySlug}` : 'Nouveau'}</span>
        {hasPending && !dirty && (
          <span style={{ fontSize: '0.75rem', color: C.accent, background: C.accentSoft, padding: '2px 8px', borderRadius: 12, border: `1px solid ${C.accentBorder}` }}>En attente de publication</span>
        )}
        {dirty && (
          <span style={{ fontSize: '0.75rem', color: C.warning, background: C.warningSoft, padding: '2px 8px', borderRadius: 12, border: `1px solid ${C.warningBorder}` }}>Non sauvegardé</span>
        )}
        {shortcode && entrySlug && (
          <button type="button" onClick={onCopyShortcode} style={{ display: 'inline-flex', alignItems: 'center', gap: '.375rem', padding: '2px 10px', borderRadius: 12, background: shortcodeCopied ? C.successSoft : C.surface2, border: `1px solid ${shortcodeCopied ? C.successBorder : C.border}`, color: shortcodeCopied ? C.success : C.dim, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'JetBrains Mono, Consolas, monospace' }}>
            {shortcodeCopied ? 'Copié ✓' : shortcode}
          </button>
        )}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {isMdx && !isReadOnly && (
          <label style={{ padding: '0.5rem 0.75rem', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: '0.8125rem', cursor: 'pointer' }}>
            Importer .md
            <input type="file" accept=".md,.mdx" onChange={onImport} style={{ display: 'none' }} />
          </label>
        )}
        <button type="button" onClick={onSave} disabled={saving} style={{ padding: '0.5rem 1.125rem', background: saving ? '#D4845C' : C.accent, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: '0.8125rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.75 : 1 }}>
          {saving ? 'Sauvegarde…' : 'Sauvegarder (Ctrl+S)'}
        </button>
      </div>
    </div>
  )
}
