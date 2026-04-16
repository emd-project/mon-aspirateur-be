'use client'

import { useState, useEffect, useCallback } from 'react'
import { getPendingChanges, clearPendingChanges } from './ContentEditor'

const LAST_DEPLOY_KEY = 'cms_last_deploy'

const C = {
  accent: '#C4622D',
  success: '#6B8F71',
  successSoft: 'rgba(107,143,113,.15)',
  successBorder: 'rgba(107,143,113,.3)',
  accentSoft: 'rgba(196,98,45,.12)',
  accentBorder: 'rgba(196,98,45,.25)',
  sidebarBorder: '#2E2A27',
  sidebarMuted: '#C4B5A5',
  sidebarText: '#F5EFE7',
  dim: '#4A4540',
  error: '#B91C1C',
  errorSoft: 'rgba(185,28,28,.08)',
  errorBorder: 'rgba(185,28,28,.35)',
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
  const [pendingCount, setPendingCount] = useState(0)
  const [lastDeploy, setLastDeploy] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const refreshPending = useCallback(() => {
    setPendingCount(getPendingChanges().length)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem(LAST_DEPLOY_KEY)
    if (stored) setLastDeploy(Number(stored))
    refreshPending()
    window.addEventListener('cms_pending_update', refreshPending)
    return () => window.removeEventListener('cms_pending_update', refreshPending)
  }, [refreshPending])

  async function publish() {
    const pending = getPendingChanges()
    if (pending.length === 0) {
      setErrorMsg('Aucune modification en attente')
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
      return
    }

    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/cms/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes: pending }),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? `Erreur ${res.status}`)
      }

      clearPendingChanges()
      const now = Date.now()
      localStorage.setItem(LAST_DEPLOY_KEY, String(now))
      setLastDeploy(now)
      setPendingCount(0)
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
      {pendingCount > 0 && status !== 'done' && (
        <p style={{
          margin: '0 0 0.5rem',
          fontSize: '0.75rem',
          color: C.accent,
          fontWeight: 600,
          textAlign: 'center',
        }}>
          {pendingCount} modification{pendingCount > 1 ? 's' : ''} en attente
        </p>
      )}

      <button
        type="button"
        onClick={publish}
        disabled={isLoading || (pendingCount === 0 && status === 'idle')}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          padding: '0.5rem 0.75rem',
          borderRadius: 8,
          border: `1px solid ${isDone ? C.successBorder : isError ? C.errorBorder : C.accentBorder}`,
          background: isDone ? C.successSoft : isError ? C.errorSoft : C.accentSoft,
          color: isDone ? C.success : isError ? C.error : C.accent,
          fontSize: '0.8125rem',
          fontWeight: 600,
          cursor: isLoading || (pendingCount === 0 && status === 'idle') ? 'not-allowed' : 'pointer',
          transition: 'opacity 0.15s',
          opacity: isLoading ? 0.7 : pendingCount === 0 && status === 'idle' ? 0.5 : 1,
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
        {isLoading
          ? 'Publication…'
          : isDone
            ? 'Mis en ligne !'
            : isError
              ? 'Échec'
              : pendingCount === 0
                ? 'Rien à publier'
                : 'Mettre en ligne'}
      </button>

      {isError && errorMsg && (
        <p style={{ margin: '0.375rem 0 0', fontSize: '0.7rem', color: C.error, lineHeight: 1.4 }}>
          {errorMsg}
        </p>
      )}

      {lastDeploy && !isError && (
        <p style={{ margin: '0.375rem 0 0', fontSize: '0.7rem', color: C.dim, textAlign: 'center' }}>
          Dernière mise en ligne : {relativeTime(lastDeploy)}
        </p>
      )}
    </div>
  )
}
