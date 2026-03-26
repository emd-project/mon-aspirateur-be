'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { CollectionDef } from '../types'

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
  warning: '#f59e0b',
  error: '#ef4444',
}

const PAGE_SIZE = 20

type SortDir = 'asc' | 'desc'

interface EntryRow {
  slug: string
  filePath: string
  sha?: string
  frontmatter: Record<string, unknown>
}

interface CollectionListProps {
  collection: string
  collectionDef: CollectionDef
  entries: EntryRow[]
  onDelete?: (entry: EntryRow) => void
  isAdmin?: boolean
}

function relativeDate(dateStr: string | undefined): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const diff = Date.now() - d.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "aujourd'hui"
  if (days === 1) return 'hier'
  if (days < 7) return `il y a ${days}j`
  if (days < 30) return `il y a ${Math.floor(days / 7)}sem`
  if (days < 365) return `il y a ${Math.floor(days / 30)}mois`
  return `il y a ${Math.floor(days / 365)}an`
}

export function CollectionList({
  collection,
  collectionDef,
  entries,
  onDelete,
  isAdmin = false,
}: CollectionListProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'live' | 'draft'>('all')
  const [sortKey, setSortKey] = useState<'title' | 'date' | 'category'>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = [...entries]

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) =>
          String(e.frontmatter.title ?? '').toLowerCase().includes(q) ||
          e.slug.toLowerCase().includes(q) ||
          String(e.frontmatter.category ?? '').toLowerCase().includes(q)
      )
    }

    // Filter
    if (filter === 'live') list = list.filter((e) => !e.frontmatter.draft || e.frontmatter.draft === 'false')
    if (filter === 'draft') list = list.filter((e) => e.frontmatter.draft === true || e.frontmatter.draft === 'true')

    // Sort
    list.sort((a, b) => {
      let va = ''
      let vb = ''
      if (sortKey === 'title') { va = String(a.frontmatter.title ?? ''); vb = String(b.frontmatter.title ?? '') }
      if (sortKey === 'date') { va = String(a.frontmatter.publishedAt ?? a.frontmatter.updatedAt ?? ''); vb = String(b.frontmatter.publishedAt ?? b.frontmatter.updatedAt ?? '') }
      if (sortKey === 'category') { va = String(a.frontmatter.category ?? ''); vb = String(b.frontmatter.category ?? '') }
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    })

    return list
  }, [entries, search, filter, sortKey, sortDir])

  const totalLive = entries.filter((e) => !e.frontmatter.draft || e.frontmatter.draft === 'false').length
  const totalDraft = entries.filter((e) => e.frontmatter.draft === true || e.frontmatter.draft === 'true').length

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  async function handleDelete(entry: EntryRow) {
    if (!isAdmin) return
    if (!window.confirm(`Supprimer "${entry.frontmatter.title ?? entry.slug}" ?`)) return
    setDeleting(entry.slug)
    try {
      const res = await fetch(`/api/cms/content/${collection}/${entry.filePath.replace(`${collectionDef.path}/`, '')}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: entry.filePath, sha: entry.sha }),
      })
      if (!res.ok) throw new Error('Erreur de suppression')
      setToast('Article supprimé')
      onDelete?.(entry)
    } catch (err) {
      setToast(String(err instanceof Error ? err.message : err))
    } finally {
      setDeleting(null)
      setTimeout(() => setToast(null), 3500)
    }
  }

  const SortIcon = ({ k }: { k: typeof sortKey }) =>
    sortKey === k ? (sortDir === 'asc' ? <span> ↑</span> : <span> ↓</span>) : null

  return (
    <div style={{ fontFamily: 'system-ui,-apple-system,sans-serif' }}>
      {/* Controls bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
        <input
          type="search"
          placeholder="Rechercher…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          style={{
            flex: 1,
            minWidth: 180,
            padding: '0.5rem 0.75rem',
            background: '#0d0d0d',
            border: `1px solid ${C.border}`,
            borderRadius: 7,
            color: C.text,
            fontSize: '0.875rem',
            outline: 'none',
          }}
        />

        {/* Filter tabs */}
        {(
          [
            { key: 'all', label: `Tous (${entries.length})` },
            { key: 'live', label: `Publiés (${totalLive})` },
            { key: 'draft', label: `Brouillons (${totalDraft})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => { setFilter(tab.key); setPage(1) }}
            style={{
              padding: '0.375rem 0.75rem',
              borderRadius: 20,
              border: `1px solid ${filter === tab.key ? C.accent : C.border}`,
              background: filter === tab.key ? 'rgba(255,61,87,.12)' : 'transparent',
              color: filter === tab.key ? C.accent : C.muted,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}

        <Link
          href={`/admin/${collection}/new`}
          style={{
            marginLeft: 'auto',
            padding: '0.5rem 0.875rem',
            background: C.accent,
            borderRadius: 7,
            color: '#fff',
            textDecoration: 'none',
            fontSize: '0.8125rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          + Nouvel article
        </Link>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {[
                { key: 'title', label: 'Titre' },
                { key: 'date', label: 'Date' },
                { key: 'category', label: 'Catégorie' },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key as typeof sortKey)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    textAlign: 'left',
                    color: C.muted,
                    fontWeight: 500,
                    cursor: 'pointer',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.label}
                  <SortIcon k={col.key as typeof sortKey} />
                </th>
              ))}
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: C.muted, fontWeight: 500 }}>Statut</th>
              <th style={{ padding: '0.5rem 0.75rem' }} />
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: C.dim }}>
                  Aucun résultat
                </td>
              </tr>
            )}
            {paginated.map((entry) => {
              const isDraft = entry.frontmatter.draft === true || entry.frontmatter.draft === 'true'
              const dateStr = String(entry.frontmatter.publishedAt ?? entry.frontmatter.updatedAt ?? '')
              const editPath = `/admin/${collection}/${entry.filePath.replace(`${collectionDef.path}/`, '').replace(/\.(mdx|yaml)$/, '')}`

              return (
                <tr
                  key={entry.slug}
                  style={{ borderBottom: `1px solid ${C.border}` }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = C.surface2)}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '')}
                >
                  <td style={{ padding: '0.75rem' }}>
                    <Link
                      href={editPath}
                      style={{ color: C.text, textDecoration: 'none', fontWeight: 500 }}
                    >
                      {String(entry.frontmatter.title ?? entry.slug)}
                    </Link>
                    <div style={{ fontSize: '0.75rem', color: C.dim, marginTop: 2 }}>{entry.slug}</div>
                  </td>
                  <td style={{ padding: '0.75rem', color: C.muted, whiteSpace: 'nowrap' }}>
                    {relativeDate(dateStr)}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {!!entry.frontmatter.category && (
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 12,
                          background: 'rgba(255,61,87,.1)',
                          border: `1px solid rgba(255,61,87,.2)`,
                          color: C.accent,
                          fontSize: '0.75rem',
                        }}
                      >
                        {String(entry.frontmatter.category)}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 12,
                        background: isDraft ? 'rgba(245,158,11,.1)' : 'rgba(34,197,94,.1)',
                        border: `1px solid ${isDraft ? 'rgba(245,158,11,.25)' : 'rgba(34,197,94,.25)'}`,
                        color: isDraft ? C.warning : C.success,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                      }}
                    >
                      {isDraft ? 'Brouillon' : 'Live'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <Link
                      href={editPath}
                      style={{ color: C.muted, fontSize: '0.8125rem', textDecoration: 'none', marginRight: '0.75rem' }}
                    >
                      Modifier
                    </Link>
                    {isAdmin && (
                      <button
                        type="button"
                        disabled={deleting === entry.slug}
                        onClick={() => handleDelete(entry)}
                        style={{ background: 'none', border: 'none', color: C.error, cursor: 'pointer', fontSize: '0.8125rem' }}
                      >
                        {deleting === entry.slug ? '…' : 'Supprimer'}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: '1rem' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                border: `1px solid ${p === page ? C.accent : C.border}`,
                background: p === page ? 'rgba(255,61,87,.12)' : 'transparent',
                color: p === page ? C.accent : C.muted,
                cursor: 'pointer',
                fontSize: '0.8125rem',
              }}
            >
              {p}
            </button>
          ))}
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
            background: C.surface,
            border: `1px solid ${C.border}`,
            color: C.text,
            fontSize: '0.875rem',
            zIndex: 9999,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
