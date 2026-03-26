'use client'

import { useState } from 'react'

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

interface SafeUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor'
}

interface UsersManagerProps {
  users: SafeUser[]
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  background: '#0d0d0d',
  border: `1px solid ${C.border}`,
  borderRadius: 7,
  color: C.text,
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

export function UsersManager({ users: initialUsers }: UsersManagerProps) {
  const [users, setUsers] = useState(initialUsers)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'editor' })
  const [saving, setSaving] = useState(false)
  const [resettingId, setResettingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/cms/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = (await res.json()) as SafeUser & { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Erreur')
      setUsers((prev) => [...prev, data])
      setForm({ name: '', email: '', password: '', role: 'editor' })
      setShowForm(false)
      showToast('Utilisateur créé ✓', true)
    } catch (err) {
      showToast(String(err instanceof Error ? err.message : err), false)
    } finally {
      setSaving(false)
    }
  }

  async function handleRoleChange(id: string, role: 'admin' | 'editor') {
    try {
      const res = await fetch('/api/cms/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role }),
      })
      if (!res.ok) throw new Error('Erreur de mise à jour')
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
      showToast('Rôle mis à jour ✓', true)
    } catch (err) {
      showToast(String(err instanceof Error ? err.message : err), false)
    }
  }

  async function handleResetPassword(id: string) {
    const newPassword = window.prompt('Nouveau mot de passe (min. 12 caractères)')
    if (!newPassword) return
    setResettingId(id)
    try {
      const res = await fetch('/api/cms/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password: newPassword }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Erreur')
      showToast('Mot de passe réinitialisé ✓', true)
    } catch (err) {
      showToast(String(err instanceof Error ? err.message : err), false)
    } finally {
      setResettingId(null)
    }
  }

  async function handleDelete(user: SafeUser) {
    if (!window.confirm(`Supprimer l'utilisateur "${user.name}" ?`)) return
    setDeletingId(user.id)
    try {
      const res = await fetch(`/api/cms/users?id=${user.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur de suppression')
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
      showToast('Utilisateur supprimé', true)
    } catch (err) {
      showToast(String(err instanceof Error ? err.message : err), false)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui,-apple-system,sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '0.5rem 0.875rem',
            background: C.accent,
            border: 'none',
            borderRadius: 7,
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
          }}
        >
          {showForm ? 'Annuler' : '+ Nouvel utilisateur'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            marginBottom: '1.25rem',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '0.9375rem', color: C.text }}>Nouvel utilisateur</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: '0.8125rem', color: C.muted }}>Nom</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: '0.8125rem', color: C.muted }}>Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: '0.8125rem', color: C.muted }}>Mot de passe (min. 12 car.)</label>
              <input type="password" required minLength={12} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: '0.8125rem', color: C.muted }}>Rôle</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={inputStyle}>
                <option value="editor">Éditeur</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{ padding: '0.5rem 0.875rem', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 7, color: C.muted, cursor: 'pointer', fontSize: '0.8125rem' }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ padding: '0.5rem 0.875rem', background: C.accent, border: 'none', borderRadius: 7, color: '#fff', fontWeight: 600, fontSize: '0.8125rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Création…' : 'Créer'}
            </button>
          </div>
        </form>
      )}

      {/* Users table */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
        {users.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: C.dim }}>Aucun utilisateur</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {['Nom', 'Email', 'Rôle', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '0.625rem 0.875rem', textAlign: 'left', color: C.muted, fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '0.75rem 0.875rem', color: C.text, fontWeight: 500 }}>{user.name}</td>
                  <td style={{ padding: '0.75rem 0.875rem', color: C.muted }}>{user.email}</td>
                  <td style={{ padding: '0.75rem 0.875rem' }}>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as 'admin' | 'editor')}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        border: `1px solid ${C.border}`,
                        background: C.surface2,
                        color: C.text,
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="editor">Éditeur</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ padding: '0.75rem 0.875rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        disabled={resettingId === user.id}
                        onClick={() => handleResetPassword(user.id)}
                        style={{ padding: '3px 10px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, cursor: 'pointer', fontSize: '0.8125rem' }}
                      >
                        {resettingId === user.id ? '…' : 'Réinit. mdp'}
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === user.id}
                        onClick={() => handleDelete(user)}
                        style={{ padding: '3px 10px', background: 'rgba(239,68,68,.1)', border: 'none', borderRadius: 6, color: C.error, cursor: 'pointer', fontSize: '0.8125rem' }}
                      >
                        {deletingId === user.id ? '…' : 'Supprimer'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
