'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import type { CollectionDef, FieldDef, ContentEntry } from '../types'
import { titleToSlug, importMarkdownFile } from '../lib/parser'
import { extractMdxBlocks, reinsertMdxBlocks, markdownToHtml, htmlToMarkdown } from '../lib/html-md'
import { WysiwygEditor, type WysiwygEditorRef } from './WysiwygEditor'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: '#FAF7F2',
  surface: '#FFFFFF',
  surface2: '#F0EBE3',
  border: '#EDE5D8',
  borderFocus: '#C4622D',
  text: '#1A1714',
  muted: '#6B5E54',
  dim: '#9C8E84',
  accent: '#C4622D',
  accentSoft: 'rgba(196,98,45,.1)',
  accentBorder: 'rgba(196,98,45,.3)',
  success: '#6B8F71',
  successSoft: 'rgba(107,143,113,.1)',
  successBorder: 'rgba(107,143,113,.3)',
  warning: '#C49A2D',
  warningSoft: 'rgba(196,154,45,.1)',
  warningBorder: 'rgba(196,154,45,.25)',
  error: '#B91C1C',
  errorSoft: 'rgba(185,28,28,.07)',
  errorBorder: 'rgba(185,28,28,.2)',
  inputBg: '#F5F0E8',
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
        borderRadius: 10,
        background: type === 'success' ? C.successSoft : C.errorSoft,
        border: `1px solid ${type === 'success' ? C.successBorder : C.errorBorder}`,
        color: type === 'success' ? C.success : C.error,
        fontSize: '0.875rem',
        fontWeight: 500,
        zIndex: 9999,
        boxShadow: '0 4px 16px rgba(26,23,20,.1)',
      }}
    >
      {message}
    </div>
  )
}

// ─── Field components ─────────────────────────────────────────────────────────

function TextField({ field, value, onChange }: { field: FieldDef & { key: string }; value: string; onChange: (v: string) => void }) {
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

function TextareaField({ field, value, onChange }: { field: FieldDef & { key: string }; value: string; onChange: (v: string) => void }) {
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

function ImageUrlField({ field, value, onChange }: { field: FieldDef & { key: string }; value: string; onChange: (v: string) => void }) {
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
            padding: '0 0.875rem',
            background: C.surface2,
            border: `1px solid ${C.border}`,
            borderRadius: 7,
            color: C.muted,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontWeight: 500,
          }}
        >
          Médiathèque
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            style={{ padding: '0 0.5rem', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 7, color: C.dim, cursor: 'pointer', fontSize: '0.75rem' }}
          >
            ✕
          </button>
        )}
      </div>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" style={{ maxHeight: 80, maxWidth: 160, borderRadius: 6, border: `1px solid ${C.border}`, objectFit: 'cover' }} />
      )}
      {open && (
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, background: C.surface, padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: 8, boxShadow: '0 4px 16px rgba(26,23,20,.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: C.muted, fontWeight: 500 }}>Sélectionner une image</span>
            <button type="button" onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: C.dim, cursor: 'pointer', fontSize: '1rem' }}>✕</button>
          </div>
          {loading && <span style={{ fontSize: '0.8125rem', color: C.dim }}>Chargement…</span>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
            {files.map((f) => {
              const url = f.download_url ?? ''
              return (
                <button
                  key={f.sha}
                  type="button"
                  onClick={() => select(url)}
                  title={f.name}
                  style={{ padding: 4, background: value === url ? C.accentSoft : C.surface2, border: `1px solid ${value === url ? C.accent : C.border}`, borderRadius: 7, cursor: 'pointer' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={f.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, display: 'block' }} />
                </button>
              )
            })}
            {!loading && files.length === 0 && (
              <span style={{ fontSize: '0.8125rem', color: C.dim }}>Aucune image dans la médiathèque.</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SelectField({ field, value, onChange }: { field: FieldDef & { key: string }; value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
      <option value="">— choisir —</option>
      {(field.options ?? []).map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
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
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, background: C.accentSoft, border: `1px solid ${C.accentBorder}`, color: C.accent, fontSize: '0.8125rem' }}
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: 14 }}
          >×</button>
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

function ListField({ field, value, onChange }: { field: FieldDef & { key: string }; value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState('')

  function add() {
    const item = input.trim()
    if (item) { onChange([...value, item]); setInput('') }
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); add() }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {value.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ flex: 1, ...inputStyle, display: 'flex', alignItems: 'center', height: 'auto', padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}>{item}</span>
          <button type="button" onClick={() => onChange(value.filter((_, i) => i !== idx))} style={{ padding: '0 0.5rem', height: 36, background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 7, color: C.error, cursor: 'pointer', fontSize: '0.875rem' }}>✕</button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 6 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey} placeholder={`Ajouter — ${field.label}…`} style={{ ...inputStyle, flex: 1 }} />
        <button type="button" onClick={add} style={{ ...ghostBtnStyle, border: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>+ Ajouter</button>
      </div>
    </div>
  )
}

function RepeaterField({ field, value, onChange }: { field: FieldDef & { key: string }; value: Record<string, string>[]; onChange: (v: Record<string, string>[]) => void }) {
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
          style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: C.muted, fontWeight: 500 }}>#{idx + 1}</span>
            <button type="button" onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', color: C.error, cursor: 'pointer', fontSize: '0.8125rem' }}>
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
  background: C.inputBg,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
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
  fontWeight: 600,
  color: C.muted,
  letterSpacing: '.01em',
}

const ghostBtnStyle: React.CSSProperties = {
  padding: '0.5rem 0.875rem',
  background: 'transparent',
  border: `1px dashed ${C.border}`,
  borderRadius: 8,
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
  shortcode?: string
  onSaved?: (entry: ContentEntry) => void
}

export function ContentEditor({ collection, collectionDef, entry, shortcode, onSaved }: ContentEditorProps) {
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
  const [shortcodeCopied, setShortcodeCopied] = useState(false)

  const isFlatPath = collectionDef.flatPath ?? false
  const isReadOnly = collectionDef.readOnly ?? false

  useEffect(() => {
    if (entry?.body) {
      const { cleaned, blocks } = extractMdxBlocks(entry.body)
      setMdxBlocks(blocks)
      setSourceBody(entry.body)
      const html = markdownToHtml(cleaned)
      setWysiwygHtml(html)
    }
  }, [entry])

  useEffect(() => { setDirty(true) }, [fields, slug, sourceBody])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); void handleSave() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  function copyShortcode() {
    if (!shortcode) return
    void navigator.clipboard.writeText(shortcode)
    setShortcodeCopied(true)
    setTimeout(() => setShortcodeCopied(false), 2000)
  }

  function setField(key: string, value: unknown) {
    setFields((prev) => {
      const next = { ...prev, [key]: value }
      if ((key === 'title' || key === 'name') && !slugLocked) setSlug(titleToSlug(String(value)))
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

    const ext = collectionDef.format === 'mdx' ? '.mdx' : '.yaml'
    const body = getCurrentBody()

    // Build file path and API URL depending on collection type
    let filePath: string
    let apiUrl: string
    if (isFlatPath) {
      filePath = `${collectionDef.path}/${slug}${ext}`
      apiUrl = `/api/cms/content/${collection}/${slug}`
    } else {
      const locale = String(fields.locale ?? 'fr')
      const categorySlug = String(fields.categorySlug ?? 'guide-achat')
      filePath = `${collectionDef.path}/${locale}/${categorySlug}/${slug}.mdx`
      apiUrl = `/api/cms/content/${collection}/${locale}/${categorySlug}/${slug}`
    }

    try {
      const res = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, frontmatter: fields, body, sha: entry?.sha }),
      })
      const data = (await res.json()) as { ok?: boolean; sha?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Erreur de sauvegarde')

      setToast({ message: 'Sauvegardé ✓', type: 'success' })
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
            {entry?.slug ? `Modifier — ${entry.slug}` : 'Nouveau'}
          </span>
          {dirty && (
            <span style={{ fontSize: '0.75rem', color: C.warning, background: C.warningSoft, padding: '2px 8px', borderRadius: 12, border: `1px solid ${C.warningBorder}` }}>
              Non sauvegardé
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {collectionDef.format === 'mdx' && !isReadOnly && (
            <label
              style={{
                padding: '0.5rem 0.75rem',
                background: 'transparent',
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                color: C.muted,
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              Importer .md
              <input type="file" accept=".md,.mdx" onChange={handleImport} style={{ display: 'none' }} />
            </label>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '0.5rem 1.125rem',
              background: saving ? '#D4845C' : C.accent,
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.75 : 1,
              letterSpacing: '-0.01em',
            }}
          >
            {saving ? 'Sauvegarde…' : 'Sauvegarder (Ctrl+S)'}
          </button>
        </div>
      </div>

      {/* Shortcode box — shown when collection has a shortcode template and entry is saved */}
      {shortcode && entry?.slug && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10 }}>
          <span style={{ fontSize: '0.8125rem', color: C.muted, fontWeight: 600, whiteSpace: 'nowrap' }}>Shortcode</span>
          <code style={{ flex: 1, fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: '0.8125rem', color: C.text, background: C.surface2, padding: '0.25rem 0.5rem', borderRadius: 5, overflow: 'auto', whiteSpace: 'nowrap' }}>
            {shortcode}
          </code>
          <button
            type="button"
            onClick={copyShortcode}
            style={{ padding: '0.375rem 0.75rem', background: shortcodeCopied ? C.success : C.surface2, border: `1px solid ${shortcodeCopied ? C.successBorder : C.border}`, borderRadius: 7, color: shortcodeCopied ? C.success : C.muted, fontSize: '0.8125rem', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 500, transition: 'all 0.15s' }}
          >
            {shortcodeCopied ? 'Copié ✓' : 'Copier'}
          </button>
        </div>
      )}

      {/* Slug — hidden only for readOnly collections (pages with fixed slugs) */}
      {!isReadOnly && (
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
      )}

      {/* Dynamic fields */}
      {Object.entries(collectionDef.fields).map(([key, field]) => (
        <div key={key}>
          <label style={labelStyle}>
            {field.label}
            {field.required && <span style={{ color: C.accent, marginLeft: 2 }}>*</span>}
          </label>

          {field.type === 'image' && (
            <ImageUrlField field={{ ...field, key }} value={String(fields[key] ?? '')} onChange={(v) => setField(key, v)} />
          )}
          {(field.type === 'text' || field.type === 'slug') && (
            <TextField field={{ ...field, key }} value={String(fields[key] ?? '')} onChange={(v) => setField(key, v)} />
          )}
          {field.type === 'textarea' && (
            <TextareaField field={{ ...field, key }} value={String(fields[key] ?? '')} onChange={(v) => setField(key, v)} />
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
            <SelectField field={{ ...field, key }} value={String(fields[key] ?? '')} onChange={(v) => setField(key, v)} />
          )}
          {field.type === 'tags' && (
            <TagsField value={Array.isArray(fields[key]) ? (fields[key] as string[]) : []} onChange={(v) => setField(key, v)} />
          )}
          {field.type === 'list' && (
            <ListField field={{ ...field, key }} value={Array.isArray(fields[key]) ? (fields[key] as string[]) : []} onChange={(v) => setField(key, v)} />
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

      {/* Body editor — only for MDX articles */}
      {collectionDef.format === 'mdx' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Corps de l&apos;article</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['wysiwyg', 'source'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={mode === 'wysiwyg' ? switchToWysiwyg : switchToSource}
                  style={{ padding: '0.3125rem 0.625rem', borderRadius: 7, border: `1px solid ${bodyMode === mode ? C.accentBorder : C.border}`, background: bodyMode === mode ? C.accentSoft : 'transparent', color: bodyMode === mode ? C.accent : C.muted, fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500 }}
                >
                  {mode === 'wysiwyg' ? 'WYSIWYG' : 'Source MDX'}
                </button>
              ))}
            </div>
          </div>

          {bodyMode === 'wysiwyg' ? (
            <>
              {Object.keys(mdxBlocks).length > 0 && (
                <div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: C.warningSoft, border: `1px solid ${C.warningBorder}`, borderRadius: 8, fontSize: '0.8125rem', color: C.warning }}>
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
