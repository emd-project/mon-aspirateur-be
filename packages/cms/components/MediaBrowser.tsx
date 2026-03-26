'use client'

import { useState, useRef } from 'react'
import type { GitHubFile } from '../types'

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  bg: '#0a0a0a',
  surface: '#111111',
  surface2: '#161616',
  border: '#222222',
  text: '#e5e5e5',
  muted: '#aaaaaa',
  dim: '#555555',
  accent: '#ff3d57',
  success: '#22c55e',
  error: '#ef4444',
}

interface MediaBrowserProps {
  files: GitHubFile[]
  isAdmin?: boolean
  onSelect?: (url: string) => void
}

export function MediaBrowser({ files: initialFiles, isAdmin = false, onSelect }: MediaBrowserProps) {
  const [files, setFiles] = useState(initialFiles)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  function getPublicUrl(file: GitHubFile): string {
    return file.path.replace(/^public\//, '/')
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          // Strip data URL prefix: "data:image/png;base64,..."
          resolve(result.split(',')[1] ?? '')
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const res = await fetch('/api/cms/media/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: file.name, base64, mimeType: file.type }),
      })
      const data = (await res.json()) as { ok?: boolean; url?: string; path?: string; sha?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Erreur upload')

      // Add to local state (approximate — will be re-fetched on reload)
      setFiles((prev) => [
        ...prev,
        {
          name: file.name,
          path: data.path ?? '',
          sha: data.sha ?? '',
          size: file.size,
          type: 'file',
          download_url: data.url ?? null,
        },
      ])
      showToast('Image uploadée ✓', true)
    } catch (err) {
      showToast(String(err instanceof Error ? err.message : err), false)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleDelete(file: GitHubFile) {
    if (!isAdmin) return
    if (!window.confirm(`Supprimer "${file.name}" ?`)) return
    setDeleting(file.path)

    try {
      const res = await fetch('/api/cms/media/', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: file.path, sha: file.sha }),
      })
      if (!res.ok) throw new Error('Erreur de suppression')
      setFiles((prev) => prev.filter((f) => f.path !== file.path))
      showToast('Image supprimée', true)
    } catch (err) {
      showToast(String(err instanceof Error ? err.message : err), false)
    } finally {
      setDeleting(null)
    }
  }

  function copyUrl(file: GitHubFile) {
    navigator.clipboard.writeText(getPublicUrl(file)).then(() => showToast('URL copiée ✓', true))
  }

  return (
    <div style={{ fontFamily: 'system-ui,-apple-system,sans-serif' }}>
      {/* Upload bar */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.25rem' }}>
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0.875rem',
            background: uploading ? '#2a0a0d' : C.accent,
            borderRadius: 7,
            color: '#fff',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.7 : 1,
          }}
        >
          {uploading ? 'Upload…' : '+ Uploader une image'}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
        <span style={{ fontSize: '0.8125rem', color: C.dim }}>
          PNG, JPEG, WebP, SVG — max 5 Mo
        </span>
      </div>

      {/* Grid */}
      {files.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: C.dim, background: C.surface, borderRadius: 8, border: `1px dashed ${C.border}` }}>
          Aucune image
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {files.map((file) => {
            const url = getPublicUrl(file)
            const isSel = selected === file.path
            const isDeleting = deleting === file.path

            return (
              <div
                key={file.path}
                onClick={() => {
                  setSelected(isSel ? null : file.path)
                  onSelect?.(url)
                }}
                style={{
                  background: C.surface,
                  border: `1px solid ${isSel ? C.accent : C.border}`,
                  borderRadius: 8,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  opacity: isDeleting ? 0.4 : 1,
                  transition: 'border-color 0.15s',
                }}
              >
                {/* Preview */}
                <div
                  style={{
                    height: 120,
                    background: C.surface2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={file.name}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <div style={{ padding: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: C.dim, marginTop: 2 }}>
                    {(file.size / 1024).toFixed(0)} Ko
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: '0.375rem' }}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); copyUrl(file) }}
                      style={{ flex: 1, padding: '3px 0', background: 'rgba(255,61,87,.1)', border: 'none', borderRadius: 5, color: C.accent, fontSize: '0.6875rem', cursor: 'pointer' }}
                    >
                      Copier URL
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={(e) => { e.stopPropagation(); handleDelete(file) }}
                        style={{ padding: '3px 8px', background: 'rgba(239,68,68,.1)', border: 'none', borderRadius: 5, color: C.error, fontSize: '0.6875rem', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            padding: '0.625rem 1rem',
            borderRadius: 8,
            background: toast.ok ? 'rgba(34,197,94,.12)' : 'rgba(239,68,68,.12)',
            border: `1px solid ${toast.ok ? 'rgba(34,197,94,.3)' : 'rgba(239,68,68,.3)'}`,
            color: toast.ok ? C.success : C.error,
            fontSize: '0.875rem',
            fontWeight: 500,
            zIndex: 9999,
          }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  )
}
