'use client'

import { useState, type KeyboardEvent } from 'react'
import type { FieldDef } from '../types'
import { C, inputStyle, labelStyle, ghostBtnStyle } from './editor-tokens'

type FP = { field: FieldDef & { key: string }; value: string; onChange: (v: string) => void }

export function TextField({ field, value, onChange }: FP) {
  return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.label} required={field.required} style={inputStyle} />
}

export function TextareaField({ field, value, onChange }: FP) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.label} required={field.required} rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
}

export function SelectField({ field, value, onChange }: FP) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
      <option value="">— choisir —</option>
      {(field.options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

export function TagsField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState('')
  function add() { const t = input.trim(); if (t && !value.includes(t)) onChange([...value, t]); setInput('') }
  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() }
    if (e.key === 'Backspace' && !input && value.length) onChange(value.slice(0, -1))
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', ...inputStyle, height: 'auto', padding: '0.375rem 0.5rem' }}>
      {value.map((tag) => (
        <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, background: C.accentSoft, border: `1px solid ${C.accentBorder}`, color: C.accent, fontSize: '0.8125rem' }}>
          {tag}
          <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>
        </span>
      ))}
      <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey} onBlur={add} placeholder="Ajouter un tag…" style={{ background: 'none', border: 'none', outline: 'none', color: C.text, fontSize: '0.875rem', minWidth: 120, flex: 1 }} />
    </div>
  )
}

export function ListField({ field, value, onChange }: { field: FieldDef & { key: string }; value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState('')
  function add() { const i = input.trim(); if (i) { onChange([...value, i]); setInput('') } }
  function handleKey(e: KeyboardEvent<HTMLInputElement>) { if (e.key === 'Enter') { e.preventDefault(); add() } }
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

export function RepeaterField({ field, value, onChange }: { field: FieldDef & { key: string }; value: Record<string, string>[]; onChange: (v: Record<string, string>[]) => void }) {
  function updateItem(idx: number, key: string, val: string) { const next = [...value]; next[idx] = { ...next[idx], [key]: val }; onChange(next) }
  function addItem() { onChange([...value, Object.fromEntries(Object.keys(field.fields ?? {}).map((k) => [k, '']))]) }
  function removeItem(idx: number) { onChange(value.filter((_, i) => i !== idx)) }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {value.map((item, idx) => (
        <div key={idx} style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: C.muted, fontWeight: 500 }}>#{idx + 1}</span>
            <button type="button" onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', color: C.error, cursor: 'pointer', fontSize: '0.8125rem' }}>Supprimer</button>
          </div>
          {Object.entries(field.fields ?? {}).map(([subKey, subField]) => (
            <div key={subKey}>
              <label style={labelStyle}>{subField.label}</label>
              {subField.type === 'textarea'
                ? <textarea value={item[subKey] ?? ''} onChange={(e) => updateItem(idx, subKey, e.target.value)} rows={3} required={subField.required} style={{ ...inputStyle, resize: 'vertical' }} />
                : <input type="text" value={item[subKey] ?? ''} onChange={(e) => updateItem(idx, subKey, e.target.value)} required={subField.required} style={inputStyle} />
              }
            </div>
          ))}
        </div>
      ))}
      <button type="button" onClick={addItem} style={ghostBtnStyle}>+ Ajouter</button>
    </div>
  )
}
