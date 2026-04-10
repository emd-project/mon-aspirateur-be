'use client'

import { useRef, useState } from 'react'

const C = {
  border: '#EDE5D8',
  surface2: '#F0EBE3',
  muted: '#6B5E54',
  success: '#6B8F71',
  successSoft: 'rgba(107,143,113,.1)',
  successBorder: 'rgba(107,143,113,.3)',
  error: '#B91C1C',
  errorSoft: 'rgba(185,28,28,.07)',
  errorBorder: 'rgba(185,28,28,.2)',
}

interface ImportResult {
  ok: boolean
  imported?: number
  updated?: number
  errors?: string[]
  error?: string
}

export function CsvImport({ collection }: { collection: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setResult(null)
    try {
      const text = await file.text()
      const res = await fetch(`/api/cms/csv/${collection}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/csv' },
        credentials: 'include',
        body: text,
      })
      const data = (await res.json()) as ImportResult
      setResult(data)
    } catch {
      setResult({ ok: false, error: 'Erreur réseau' })
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const isSuccess = result?.ok && !result?.error
  const hasErrors = (result?.errors?.length ?? 0) > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', alignItems: 'flex-end' }}>
      <label
        style={{ padding: '0.5rem 0.875rem', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: '0.8125rem', fontWeight: 500, cursor: loading ? 'wait' : 'pointer', whiteSpace: 'nowrap', opacity: loading ? 0.6 : 1 }}
      >
        {loading ? 'Import en cours…' : 'Importer CSV'}
        <input ref={inputRef} type="file" accept=".csv,text/csv" onChange={handleFile} style={{ display: 'none' }} disabled={loading} />
      </label>

      {result && (
        <div style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', borderRadius: 7, background: isSuccess ? C.successSoft : C.errorSoft, border: `1px solid ${isSuccess ? C.successBorder : C.errorBorder}`, color: isSuccess ? C.success : C.error, maxWidth: 320 }}>
          {result.error && <span>{result.error}</span>}
          {isSuccess && (
            <span>
              {result.imported! > 0 && `${result.imported} créé${result.imported! > 1 ? 's' : ''}`}
              {result.imported! > 0 && result.updated! > 0 && ' · '}
              {result.updated! > 0 && `${result.updated} mis à jour`}
              {hasErrors && ` · ${result.errors!.length} erreur${result.errors!.length > 1 ? 's' : ''}`}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
