'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'cms_last_deploy'

const C = {
  accent: '#C4622D',
  success: '#6B8F71',
  successSoft: 'rgba(107,143,113,.15)',
  successBorder: 'rgba(107,143,113,.3)',
  accentSoft: 'rgba(196,98,45,.12)',
  accentBorder: 'rgba(196,98,45,.25)',
  sidebarBorder: '#2E2A27',
  sidebarMuted: '#C4B5A5',
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60000)
  if (min < 1) return "à l'instant"
  if (min < 60) return `il y a ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `il y a ${h}h`
  const d = Math.floor(h / 24)
  return `il y a ${d}j`
}

export function PublishBar() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [lastDeploy, setLastDeploy] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setLastDeploy(Number(stored))
  }, [])

  async function publish() {
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/cms/deploy', { method: 'POST' })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? `Erreur ${res.status}`)
      }
      const now = Date.now()
      localStorage.setItem(STORAGE_KEY, String(now))
      setLastDeploy(now)
      setStatus('done')
      setTimeout(() => setStatus('idle'), 4000)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur inconnue')
      setStatus('error')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  const isLoading = status === 'loading'
  const isDone = status === 'done'
  const isError = status === 'error'

  return (
    <div style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${C.sidebarBorder}` }}>
      <button
        type="button"
        onClick={publish}
        disabled={isLoading}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          padding: '0.5rem 0.75rem',
          borderRadius: 8,
          border: `1px solid ${isDone ? C.successBorder : isError ? 'rgba(185,28,28,.35)' : C.accentBorder}`,
          background: isDone ? C.successSoft : isError ? 'rgba(185,28,28,.08)' : C.accentSoft,
          color: isDone ? C.success : isError ? '#B91C1C' : C.accent,
          fontSize: '0.8125rem',
          fontWeight: 600,
          cursor: isLoading ? 'wait' : 'pointer',
          transition: 'opacity 0.15s',
          opacity: isLoading ? 0.7 : 1,
          letterSpacing: '-0.01em',
        }}
      >
        {isLoading && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden
            style={{ animation: 'spin 1s linear infinite' }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="60" strokeDashoffset="15"/>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </svg>
        )}
        {isDone && '✓ '}
        {isLoading ? 'Déploiement…' : isDone ? 'Mis en ligne !' : isError ? 'Échec' : 'Mettre en ligne'}
      </button>

      {isError && errorMsg && (
        <p style={{ margin: '0.375rem 0 0', fontSize: '0.7rem', color: '#B91C1C', lineHeight: 1.4 }}>
          {errorMsg}
        </p>
      )}

      {lastDeploy && !isError && (
        <p style={{ margin: '0.375rem 0 0', fontSize: '0.7rem', color: '#4A4540', textAlign: 'center' }}>
          Dernière mise en ligne : {relativeTime(lastDeploy)}
        </p>
      )}
    </div>
  )
}
