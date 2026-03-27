'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import type { CollectionDef, FieldDef, ContentEntry } from '../types'
import { titleToSlug, importMarkdownFile } from '../lib/parser'
import { extractMdxBlocks, reinsertMdxBlocks, markdownToHtml, htmlToMarkdown } from '../lib/html-md'
import { WysiwygEditor, type WysiwygEditorRef } from './WysiwygEditor'

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  bg: '#0a0a0a',
  surface: '#111111',
  surface2: '#161616',
  border: '#222222',
  borderHover: '#333333',
  text: '#e5e5e5',
  muted: '#aaaaaa',
  dim: '#666666',
  accent: '#ff3d57',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onDone }: { message: string; type: 'success' | 'error'; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        padding: '0.625rem 1rem',
        borderRadius: 8,
        background: type === 'success' ? 'rgba(34,197,94,.12)' : 'rgba(239,68,68,.12)',
        border: `1px solid ${type === 'success' ? 'rgba(34,197,94,.3)' : 'rgba(239,68,68,.3)'}`,
        color: type === 'success' ? C.success : C.error,
        fontSize: '0.875rem',
        fontWeight: 500,
        zIndex: 9999,
        boxShadow: '0 4px 16px rgba(0,0,0,.4)',
      }}
    >
      {message}
    </div>
  )
}

// ─── Field components ────────────────────────────────────────────────────────

function TextField({
  field,
  value,
  onChange,
}: {
  field: FieldDef & { key: string }
  value: string
  onChange: (v: string) => void
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.label}
      required={field.required}
      style={inputStyle}
    />
  )
}

function TextareaField({
  field,
  value,
  onChange,
}: {
  field: FieldDef & { key: string }
  value: string
  onChange: (v: string) => void
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.label}
      required={field.required}
      rows={3}
      style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
    />
  )
}

type MediaFile = { name: string; sha: string; download_url: string | null }

function ImageUrlField({
  field,
  value,
  onChange,
}: {
  field: FieldDef & { key: string }
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(false)

  async function openBrowser() {
    setOpen(true)
    if (files.length > 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/cms/media', { credentials: 'include' })
      const data = await res.json() as { files?: MediaFile[] }
      setFiles(data.files ?? [])
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }

  function select(url: string) { onChange(url); setOpen(false) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.label}
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          type="button"
          onClick={openBrowser}
          style={{
            padding: '0 0.75rem',
            background: C.surface2,
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            color: C.muted,
            fontSize: '0.75rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Médiathèque
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            style={{ padding: '0 0.5rem', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 6, color: C.dim, cursor: 'pointer', fontSize: '0.75rem' }}
          >
            ✕
          </button>
        )}
      </div>
      {value && (
        <img src={value} alt="" style={{ maxHeight: 80, maxWidth: 160, borderRadius: 4, border: `1px solid ${C.border}`, objectFit: 'cover' }} />
      )}
      {open && (
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, background: C.surface, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: C.muted }}>Sélectionner une image</span>
            <button type="button" onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: C.dim, cursor: 'pointer', fontSize: '1rem' }}>✕</button>
          </div>
          {loading && <span style={{ fontSize: '0.75rem', color: C.dim }}>Chargement…</span>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
            {files.map((f) => {
              const url = f.download_url ?? ''
              return (
                <button
                  key={f.sha}
                  type="button"
                  onClick={() => select(url)}
                  title={f.name}
                  style={{ padding: 4, background: value === url ? C.accent : C.surface2, border: `1px solid ${value === url ? C.accent : C.border}`, borderRadius: 6, cursor: 'pointer' }}
                >
                  <img src={url} alt={f.name} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 4, display: 'block' }} />
                </button>
              )
            })}
            {!loading && files.length === 0 && (
              <span style={{ fontSize: '0.75rem', color: C.dim }}>Aucune image dans la médiathèque.</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SelectField({
  field,
  value,
  onChange,
}: {
  field: FieldDef & { key: string }
  value: string
  onChange: (v: string) => void
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
      <option value="">— choisir —</option>
      {(field.options ?? []).map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

function TagsField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState('')

  function add() {
    const tag = input.trim()
    if (tag && !value.includes(tag)) onChange([...value, tag])
    setInput('')
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() }
    if (e.key === 'Backspace' && !input && value.length) onChange(value.slice(0, -1))
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', ...inputStyle, height: 'auto', padding: '0.375rem 0.5rem' }}>
      {value.map((tag) => (
        <span
          key={tag}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 8px',
            borderRadius: 20,
            background: 'rgba(255,61,87,.15)',
            border: `1px solid rgba(255,61,87,.3)`,
            color: C.accent,
            fontSize: '0.8125rem',
          }}
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: 14 }}
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={add}
        placeholder="Ajouter un tag…"
        style={{ background: 'none', border: 'none', outline: 'none', color: C.text, fontSize: '0.875rem', minWidth: 120, flex: 1 }}
      />
    </div>
  )
}

function RepeaterField({
  field,
  value,
  onChange,
}: {
  field: FieldDef & { key: string }
  value: Record<string, string>[]
  onChange: (v: Record<string, string>[]) => void
}) {
  function updateItem(idx: number, key: string, val: string) {
    const next = [...value]
    next[idx] = { ...next[idx], [key]: val }
    onChange(next)
  }

  function addItem() {
    const empty = Object.fromEntries(Object.keys(field.fields ?? {}).map((k) => [k, '']))
    onChange([...value, empty])
  }

  function removeItem(idx: number) {
    onChange(value.filter((_, i) => i !== idx))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {value.map((item, idx) => (
        <div
          key={idx}
          style={{
            background: C.surface2,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: C.muted }}>#{idx + 1}</span>
            <button
              type="button"
              onClick={() => removeItem(idx)}
              style={{ background: 'none', border: 'none', color: C.error, cursor: 'pointer', fontSize: '0.8125rem' }}
            >
              Supprimer
            </button>
          </div>
          {Object.entries(field.fields ?? {}).map(([subKey, subField]) => (
            <div key={subKey}>
              <label style={labelStyle}>{subField.label}</label>
              {subField.type === 'textarea' ? (
                <textarea
                  value={item[subKey] ?? ''}
                  onChange={(e) => updateItem(idx, subKey, e.target.value)}
                  rows={3}
                  required={subField.required}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              ) : (
                <input
                  type="text"
                  value={item[subKey] ?? ''}
                  onChange={(e) => updateItem(idx, subKey, e.target.value)}
                  required={subField.required}
                  style={inputStyle}
                />
              )}
            </div>
          ))}
        </div>
      ))}
      <button type="button" onClick={addItem} style={ghostBtnStyle}>
        + Ajouter
      </button>
    </div>
  )
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5625rem 0.75rem',
  background: '#0d0d0d',
  border: `1px solid ${C.border}`,
  borderRadius: 7,
  color: C.text,
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '0.375rem',
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: C.muted,
}

const ghostBtnStyle: React.CSSProperties = {
  padding: '0.5rem 0.875rem',
  background: 'transparent',
  border: `1px dashed ${C.border}`,
  borderRadius: 7,
  color: C.muted,
  fontSize: '0.8125rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ContentEditorProps {
  collection: string
  collectionDef: CollectionDef
  entry?: ContentEntry
  onSaved?: (entry: ContentEntry) => void
}

export function ContentEditor({ collection, collectionDef, entry, onSaved }: ContentEditorProps) {
  const [fields, setFields] = useState<Record<string, unknown>>(() => entry?.frontmatter ?? {})
  const [slug, setSlug] = useState(entry?.slug ?? '')
  const [slugLocked, setSlugLocked] = useState(!!entry?.slug)
  const [bodyMode, setBodyMode] = useState<'wysiwyg' | 'source'>('wysiwyg')
  const [sourceBody, setSourceBody] = useState(entry?.body ?? '')
  const [mdxBlocks, setMdxBlocks] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const editorRef = useRef<WysiwygEditorRef>(null)
  const [wysiwygHtml, setWysiwygHtml] = useState('')
  const [dirty, setDirty] = useState(false)

  // Init WYSIWYG from entry body
  useEffect(() => {
    if (entry?.body) {
      const { cleaned, blocks } = extractMdxBlocks(entry.body)
      setMdxBlocks(blocks)
      setSourceBody(entry.body)
      const html = markdownToHtml(cleaned)
      setWysiwygHtml(html)
    }
  }, [entry])

  // Dirty tracking
  useEffect(() => { setDirty(true) }, [fields, slug, sourceBody])

  // Warn on unload if dirty
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  // Ctrl+S to save
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); void handleSave() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  function setField(key: string, value: unknown) {
    setFields((prev) => {
      const next = { ...prev, [key]: value }
      // Auto-slug from title
      if (key === 'title' && !slugLocked) {
        setSlug(titleToSlug(String(value)))
      }
      return next
    })
  }

  function getCurrentBody(): string {
    if (bodyMode === 'source') return sourceBody
    const html = editorRef.current?.getHTML() ?? wysiwygHtml
    const md = htmlToMarkdown(html)
    return reinsertMdxBlocks(md, mdxBlocks)
  }

  function switchToSource() {
    const html = editorRef.current?.getHTML() ?? wysiwygHtml
    const md = htmlToMarkdown(html)
    setSourceBody(reinsertMdxBlocks(md, mdxBlocks))
    setBodyMode('source')
  }

  function switchToWysiwyg() {
    const { cleaned, blocks } = extractMdxBlocks(sourceBody)
    setMdxBlocks(blocks)
    const html = markdownToHtml(cleaned)
    setWysiwygHtml(html)
    editorRef.current?.setHTML(html)
    setBodyMode('wysiwyg')
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const raw = reader.result as string
      const { frontmatter: fm, body: importedBody } = importMarkdownFile(raw)
      setFields(fm)
      if (!slug && fm.title) setSlug(titleToSlug(String(fm.title)))
      const { cleaned, blocks } = extractMdxBlocks(importedBody)
      setMdxBlocks(blocks)
      setSourceBody(importedBody)
      const html = markdownToHtml(cleaned)
      setWysiwygHtml(html)
      editorRef.current?.setHTML(html)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  async function handleSave() {
    if (saving) return
    setSaving(true)

    const locale = String(fields.locale ?? 'fr')
    const categorySlug = String(fields.categorySlug ?? 'guide-achat')
    const filePath = `${collectionDef.path}/${locale}/${categorySlug}/${slug}.mdx`
    const body = getCurrentBody()

    try {
      const res = await fetch(`/api/cms/content/${collection}/${locale}/${categorySlug}/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, frontmatter: fields, body, sha: entry?.sha }),
      })
      const data = (await res.json()) as { ok?: boolean; sha?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Erreur de sauvegarde')

      setToast({ message: 'Article sauvegardé ✓', type: 'success' })
      setDirty(false)
      onSaved?.({ slug, filePath, frontmatter: fields, body, sha: data.sha })
    } catch (err) {
      setToast({ message: String(err instanceof Error ? err.message : err), type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'system-ui,-apple-system,sans-serif' }}>
      {/* Sticky header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: C.bg,
          borderBottom: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 0',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.875rem', color: C.muted }}>
            {entry?.slug ? `Modifier — ${entry.slug}` : 'Nouvel article'}
          </span>
          {dirty && (
            <span style={{ fontSize: '0.75rem', color: C.warning, background: 'rgba(245,158,11,.1)', padding: '2px 8px', borderRadius: 12 }}>
              Non sauvegardé
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <label
            style={{
              padding: '0.5rem 0.75rem',
              background: 'transparent',
              border: `1px solid ${C.border}`,
              borderRadius: 7,
              color: C.muted,
              fontSize: '0.8125rem',
              cursor: 'pointer',
            }}
          >
            Importer .md
            <input type="file" accept=".md,.mdx" onChange={handleImport} style={{ display: 'none' }} />
          </label>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '0.5rem 1rem',
              background: saving ? '#2a0a0d' : C.accent,
              border: 'none',
              borderRadius: 7,
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Sauvegarde…' : 'Sauvegarder (Ctrl+S)'}
          </button>
        </div>
      </div>

      {/* Slug */}
      <div>
        <label style={labelStyle}>
          Slug
          {slugLocked && (
            <button
              type="button"
              onClick={() => setSlugLocked(false)}
              style={{ marginLeft: 8, background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: '0.75rem' }}
            >
              Modifier
            </button>
          )}
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          readOnly={slugLocked}
          style={{ ...inputStyle, color: slugLocked ? C.dim : C.text }}
        />
      </div>

      {/* Dynamic fields */}
      {Object.entries(collectionDef.fields).map(([key, field]) => (
        <div key={key}>
          <label style={labelStyle}>
            {field.label}
            {field.required && <span style={{ color: C.accent, marginLeft: 2 }}>*</span>}
          </label>

          {field.type === 'image' && (
            <ImageUrlField
              field={{ ...field, key }}
              value={String(fields[key] ?? '')}
              onChange={(v) => setField(key, v)}
            />
          )}
          {(field.type === 'text' || field.type === 'slug') && (
            <TextField
              field={{ ...field, key }}
              value={String(fields[key] ?? '')}
              onChange={(v) => setField(key, v)}
            />
          )}
          {field.type === 'textarea' && (
            <TextareaField
              field={{ ...field, key }}
              value={String(fields[key] ?? '')}
              onChange={(v) => setField(key, v)}
            />
          )}
          {field.type === 'number' && (
            <input
              type="number"
              value={String(fields[key] ?? '')}
              onChange={(e) => setField(key, e.target.valueAsNumber || '')}
              style={inputStyle}
            />
          )}
          {field.type === 'date' && (
            <input
              type="date"
              value={String(fields[key] ?? '').slice(0, 10)}
              onChange={(e) => setField(key, e.target.value)}
              style={inputStyle}
            />
          )}
          {field.type === 'select' && (
            <SelectField
              field={{ ...field, key }}
              value={String(fields[key] ?? '')}
              onChange={(v) => setField(key, v)}
            />
          )}
          {field.type === 'tags' && (
            <TagsField
              value={Array.isArray(fields[key]) ? (fields[key] as string[]) : []}
              onChange={(v) => setField(key, v)}
            />
          )}
          {field.type === 'repeater' && (
            <RepeaterField
              field={{ ...field, key }}
              value={Array.isArray(fields[key]) ? (fields[key] as Record<string, string>[]) : []}
              onChange={(v) => setField(key, v)}
            />
          )}
        </div>
      ))}

      {/* Body editor */}
      {collectionDef.format === 'mdx' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Corps de l&apos;article</label>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                type="button"
                onClick={switchToWysiwyg}
                style={{
                  padding: '0.3125rem 0.625rem',
                  borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  background: bodyMode === 'wysiwyg' ? C.accent : 'transparent',
                  color: bodyMode === 'wysiwyg' ? '#fff' : C.muted,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                WYSIWYG
              </button>
              <button
                type="button"
                onClick={switchToSource}
                style={{
                  padding: '0.3125rem 0.625rem',
                  borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  background: bodyMode === 'source' ? C.accent : 'transparent',
                  color: bodyMode === 'source' ? '#fff' : C.muted,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Source MDX
              </button>
            </div>
          </div>

          {bodyMode === 'wysiwyg' ? (
            <>
              {Object.keys(mdxBlocks).length > 0 && (
                <div
                  style={{
                    marginBottom: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(245,158,11,.08)',
                    border: `1px solid rgba(245,158,11,.25)`,
                    borderRadius: 7,
                    fontSize: '0.8125rem',
                    color: C.warning,
                  }}
                >
                  {Object.keys(mdxBlocks).length} composant(s) MDX préservé(s) — passez en mode Source pour les modifier.
                </div>
              )}
              <WysiwygEditor
                ref={editorRef}
                initialHTML={wysiwygHtml}
                onChange={setWysiwygHtml}
                placeholder="Rédigez le contenu de l'article ici…"
              />
            </>
          ) : (
            <textarea
              value={sourceBody}
              onChange={(e) => setSourceBody(e.target.value)}
              rows={24}
              spellCheck={false}
              style={{
                ...inputStyle,
                resize: 'vertical',
                fontFamily: 'JetBrains Mono, Consolas, monospace',
                fontSize: '0.8125rem',
                lineHeight: 1.6,
                tabSize: 2,
              }}
              placeholder="MDX source…"
            />
          )}
        </div>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
      )}
    </div>
  )
}
