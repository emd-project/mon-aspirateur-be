'use client'

import { useState } from 'react'
import { C, inputStyle } from './editor-tokens'

type MediaFile = { name: string; sha: string; download_url: string | null }

interface Props {
  n: number
  imageUrl: string
  altText: string
  caption?: string
  featured?: boolean
  onImageChange: (v: string) => void
  onAltChange: (v: string) => void
  onCaptionChange?: (v: string) => void
}

export function EditorImageCard({ n, imageUrl, altText, caption, featured, onImageChange, onAltChange, onCaptionChange }: Props) {
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(false)

  async function openBrowser() {
    setOpen(true)
    if (files.length > 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/cms/media', { credentials: 'include' })
      const data = await res.json() as MediaFile[] | { files?: MediaFile[] }
      setFiles(Array.isArray(data) ? data : (data.files ?? []))
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  return (
    <div style={{ border: `1px solid ${featured ? C.accentBorder : C.border}`, borderRadius: 10, overflow: 'hidden', background: C.surface }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: featured ? C.accentSoft : C.surface2, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: C.text }}>Image {n}</span>
          {featured && <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: C.accent, background: C.surface, padding: '1px 8px', borderRadius: 10, border: `1px solid ${C.accentBorder}` }}>Principale</span>}
        </div>
        {imageUrl && <button type="button" onClick={() => onImageChange('')} style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer', fontSize: '0.75rem' }}>Retirer</button>}
      </div>

      <div style={{ padding: '0.75rem' }}>
        {/* Preview or placeholder */}
        {imageUrl ? (
          <div style={{ position: 'relative', marginBottom: '0.625rem', borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.border}` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={altText} style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
            <button type="button" onClick={openBrowser} style={{ position: 'absolute', bottom: 6, right: 6, padding: '0.3rem 0.6rem', background: 'rgba(255,255,255,.9)', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: '0.75rem', color: C.muted, cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
              Changer
            </button>
          </div>
        ) : (
          <button type="button" onClick={openBrowser} style={{ width: '100%', height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.surface2, border: `2px dashed ${C.border}`, borderRadius: 8, color: C.dim, fontSize: '0.8125rem', cursor: 'pointer', marginBottom: '0.625rem' }}>
            + Choisir une image
          </button>
        )}

        {/* Alt text */}
        <input type="text" value={altText} onChange={(e) => onAltChange(e.target.value)} placeholder="Texte alternatif" style={{ ...inputStyle, fontSize: '0.8125rem', marginBottom: onCaptionChange ? 6 : 0 }} />

        {/* Caption (articles only) */}
        {onCaptionChange && (
          <input type="text" value={caption ?? ''} onChange={(e) => onCaptionChange(e.target.value)} placeholder="Légende (optionnel)" style={{ ...inputStyle, fontSize: '0.8125rem' }} />
        )}

        {/* Media browser modal */}
        {open && (
          <div style={{ marginTop: 8, border: `1px solid ${C.border}`, borderRadius: 10, background: C.surface, padding: '0.75rem', boxShadow: '0 4px 16px rgba(26,23,20,.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '0.8125rem', color: C.muted, fontWeight: 500 }}>Médiathèque</span>
              <button type="button" onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: C.dim, cursor: 'pointer', fontSize: '1rem' }}>✕</button>
            </div>
            {loading && <span style={{ fontSize: '0.8125rem', color: C.dim }}>Chargement…</span>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
              {files.map((f) => {
                const url = f.download_url ?? ''
                return (
                  <button key={f.sha} type="button" onClick={() => { onImageChange(url); setOpen(false) }} title={f.name} style={{ padding: 3, background: imageUrl === url ? C.accentSoft : C.surface2, border: `1px solid ${imageUrl === url ? C.accent : C.border}`, borderRadius: 6, cursor: 'pointer' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={f.name} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 4, display: 'block' }} />
                  </button>
                )
              })}
              {!loading && files.length === 0 && <span style={{ fontSize: '0.8125rem', color: C.dim }}>Aucune image.</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
