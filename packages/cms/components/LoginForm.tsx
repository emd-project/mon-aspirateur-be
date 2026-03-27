'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

// ─── Design tokens (warm palette matching site) ───────────────────────────────
const C = {
  bg: '#FAF7F2',
  surface: '#FFFFFF',
  border: '#EDE5D8',
  borderFocus: '#C4622D',
  text: '#1A1714',
  muted: '#6B5E54',
  dim: '#9C8E84',
  accent: '#C4622D',
  accentHover: '#A84F22',
  inputBg: '#F5F0E8',
  error: '#B91C1C',
  errorBg: 'rgba(185,28,28,.07)',
  errorBorder: 'rgba(185,28,28,.25)',
}

interface LoginFormProps {
  siteName: string
}

export function LoginForm({ siteName }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchParams = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams()
  const oauthError = searchParams.get('error')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/cms/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok) { setError(data.error ?? 'Erreur de connexion'); return }
      router.push('/admin/dashboard')
    } catch {
      setError('Impossible de joindre le serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: C.bg,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          boxShadow: '0 8px 32px rgba(26,23,20,.08), 0 2px 8px rgba(26,23,20,.04)',
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              borderRadius: 12,
              background: C.accent,
              marginBottom: '1rem',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 19c0-4.5 1.5-7.5 7-7.5s7 3 7 7.5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="7.5" r="3" fill="#fff"/>
            </svg>
          </div>
          <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: 700, color: C.text, letterSpacing: '-0.02em' }}>
            {siteName}
          </h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: C.muted }}>Administration</p>
        </div>

        {/* GitHub OAuth */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/cms/auth/login"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.625rem',
            width: '100%',
            padding: '0.625rem 1rem',
            background: C.inputBg,
            border: `1px solid ${C.border}`,
            borderRadius: '10px',
            color: C.text,
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            boxSizing: 'border-box',
            transition: 'border-color 0.15s, background 0.15s',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={C.text} aria-hidden>
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.09.682-.218.682-.484 0-.236-.009-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
          Se connecter avec GitHub
        </a>

        {oauthError && (
          <p style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: C.errorBg, border: `1px solid ${C.errorBorder}`, borderRadius: '8px', color: C.error, fontSize: '0.8125rem', margin: '0.75rem 0 0' }}>
            {oauthError === 'unauthorized' ? 'Compte GitHub non autorisé.' : 'Erreur OAuth. Réessayez.'}
          </p>
        )}

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: 1, background: C.border }} />
          <span style={{ fontSize: '0.75rem', color: C.dim }}>ou</span>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        {/* Email / password */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="cms-email" style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: 500, color: C.muted }}>
              Email
            </label>
            <input
              id="cms-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5625rem 0.75rem', background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label htmlFor="cms-password" style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: 500, color: C.muted }}>
              Mot de passe
            </label>
            <input
              id="cms-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5625rem 0.75rem', background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {error && (
            <p style={{ margin: 0, padding: '0.5rem 0.75rem', background: C.errorBg, border: `1px solid ${C.errorBorder}`, borderRadius: '8px', color: C.error, fontSize: '0.8125rem' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.625rem 1rem',
              background: loading ? '#D4845C' : C.accent,
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.75 : 1,
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
