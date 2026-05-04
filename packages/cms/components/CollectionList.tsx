'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { CollectionDef } from '../types'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: '#FAF7F2',
  surface: '#FFFFFF',
  surface2: '#F0EBE3',
  border: '#EDE5D8',
  text: '#1A1714',
  muted: '#6B5E54',
  dim: '#9C8E84',
  accent: '#C4622D',
  accentSoft: 'rgba(196,98,45,.1)',
  accentBorder: 'rgba(196,98,45,.25)',
  success: '#6B8F71',
  successSoft: 'rgba(107,143,113,.1)',
  successBorder: 'rgba(107,143,113,.25)',
  warning: '#C49A2D',
  warningSoft: 'rgba(196,154,45,.1)',
  warningBorder: 'rgba(196,154,45,.25)',
  error: '#B91C1C',
  errorSoft: 'rgba(185,28,28,.07)',
  errorBorder: 'rgba(185,28,28,.2)',
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

const inputStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 180,
  padding: '0.5rem 0.75rem',
  background: '#F5F0E8',
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  color: C.text,
  fontSize: '0.875rem',
  outline: 'none',
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
  const [deletedPaths, setDeletedPaths] = useState<Set<string>>(new Set())

  const isReadOnly = collectionDef.readOnly ?? false

  const filtered = useMemo(() => {
    let list = entries.filter(e => !deletedPaths.has(e.filePath))
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) =>
          String(e.frontmatter.title ?? '').toLowerCase().includes(q) ||
          e.slug.toLowerCase().includes(q) ||
          String(e.frontmatter.category ?? '').toLowerCase().includes(q)
      )
    }
    if (filter === 'live') list = list.filter((e) => !e.frontmatter.draft || e.frontmatter.draft === 'false')
    if (filter === 'draft') list = list.filter((e) => e.frontmatter.draft === true || e.frontmatter.draft === 'true')
    list.sort((a, b) => {
      let va = ''; let vb = ''
      if (sortKey === 'title') { va = String(a.frontmatter.title ?? ''); vb = String(b.frontmatter.title ?? '') }
      if (sortKey === 'date') { va = String(a.frontmatter.publishedAt ?? a.frontmatter.updatedAt ?? ''); vb = String(b.frontmatter.publishedAt ?? b.frontmatter.updatedAt ?? '') }
      if (sortKey === 'category') { va = String(a.frontmatter.category ?? ''); vb = String(b.frontmatter.category ?? '') }
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    })
    return list
  }, [entries, deletedPaths, search, filter, sortKey, sortDir])

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
    if (!isAdmin || isReadOnly) return
    if (!window.confirm(`Supprimer "${entry.frontmatter.title ?? entry.slug}" ?`)) return
    setDeleting(entry.slug)
    try {
      const res = await fetch(`/api/cms/content/${collection}/${entry.filePath.replace(`${collectionDef.path}/`, '')}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: entry.filePath, sha: entry.sha }),
      })
      if (!res.ok) throw new Error('Erreur de suppression')
      setDeletedPaths(prev => new Set([...prev, entry.filePath]))
      setToast('Entrée supprimée')
      onDelete?.(entry)
    } catch (err) {
      setToast(String(err instanceof Error ? err.message : err))
    } finally {
      setDeleting(null)
      setTimeout(() => setToast(null), 3500)
    }
  }

  const SortIcon = ({ k }: { k: typeof sortKey }) =>
    sortKey === k ? (sortDir === 'asc' ? <span style={{ color: C.accent }}> ↑</span> : <span style={{ color: C.accent }}> ↓</span>) : null

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
        <input
          type="search"
          placeholder="Rechercher…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          style={inputStyle}
        />

        {!isReadOnly && (
          <>
            {[
              { key: 'all', label: `Tous (${entries.length})` },
              { key: 'live', label: `Publiés (${totalLive})` },
              { key: 'draft', label: `Brouillons (${totalDraft})` },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => { setFilter(tab.key as typeof filter); setPage(1) }}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: 20,
                  border: `1px solid ${filter === tab.key ? C.accentBorder : C.border}`,
                  background: filter === tab.key ? C.accentSoft : 'transparent',
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
                padding: '0.5rem 1rem',
                background: C.accent,
                borderRadius: 8,
                color: '#fff',
                textDecoration: 'none',
                fontSize: '0.8125rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                letterSpacing: '-0.01em',
              }}
            >
              + Nouveau
            </Link>
          </>
        )}

        {isReadOnly && (
          <span style={{ fontSize: '0.8125rem', color: C.dim, marginLeft: 'auto' }}>
            {entries.length} page{entries.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Table */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#F5F0E8', borderBottom: `1px solid ${C.border}` }}>
              {[
                { key: 'title', label: 'Titre' },
                { key: 'date', label: 'Date' },
                { key: 'category', label: 'Catégorie' },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key as typeof sortKey)}
                  style={{
                    padding: '0.625rem 0.875rem',
                    textAlign: 'left',
                    color: C.muted,
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                    letterSpacing: '.01em',
                  }}
                >
                  {col.label}<SortIcon k={col.key as typeof sortKey} />
                </th>
              ))}
              {!isReadOnly && (
                <th style={{ padding: '0.625rem 0.875rem', textAlign: 'left', color: C.muted, fontWeight: 600, fontSize: '0.8125rem' }}>Statut</th>
              )}
              <th style={{ padding: '0.625rem 0.875rem' }} />
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={isReadOnly ? 4 : 5} style={{ padding: '3rem', textAlign: 'center', color: C.dim }}>
                  Aucun résultat
                </td>
              </tr>
            )}
            {paginated.map((entry, i) => {
              const isDraft = entry.frontmatter.draft === true || entry.frontmatter.draft === 'true'
              const dateStr = String(entry.frontmatter.publishedAt ?? entry.frontmatter.updatedAt ?? '')
              const editPath = `/admin/${collection}/${entry.filePath.replace(`${collectionDef.path}/`, '').replace(/\.(mdx|yaml)$/, '')}`
              const isLast = i === paginated.length - 1

              return (
                <tr
                  key={entry.slug}
                  style={{ borderBottom: isLast ? 'none' : `1px solid ${C.border}`, transition: 'background 0.1s' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '#F5F0E8')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '')}
                >
                  <td style={{ padding: '0.875rem' }}>
                    <Link href={editPath} style={{ color: C.text, textDecoration: 'none', fontWeight: 500 }}>
                      {String(entry.frontmatter.title ?? entry.frontmatter.hero_headline ?? entry.slug)}
                    </Link>
                    <div style={{ fontSize: '0.75rem', color: C.dim, marginTop: 2 }}>{entry.slug}</div>
                  </td>
                  <td style={{ padding: '0.875rem', color: C.muted, whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
                    {relativeDate(dateStr)}
                  </td>
                  <td style={{ padding: '0.875rem' }}>
                    {!!entry.frontmatter.category && (
                      <span style={{ padding: '2px 8px', borderRadius: 12, background: C.accentSoft, border: `1px solid ${C.accentBorder}`, color: C.accent, fontSize: '0.75rem' }}>
                        {String(entry.frontmatter.category)}
                      </span>
                    )}
                  </td>
                  {!isReadOnly && (
                    <td style={{ padding: '0.875rem' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 12,
                        background: isDraft ? C.warningSoft : C.successSoft,
                        border: `1px solid ${isDraft ? C.warningBorder : C.successBorder}`,
                        color: isDraft ? C.warning : C.success,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                      }}>
                        {isDraft ? 'Brouillon' : 'Live'}
                      </span>
                    </td>
                  )}
                  <td style={{ padding: '0.875rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <Link href={editPath} style={{ color: C.accent, fontSize: '0.8125rem', textDecoration: 'none', marginRight: isAdmin && !isReadOnly ? '0.875rem' : 0, fontWeight: 500 }}>
                      Modifier →
                    </Link>
                    {isAdmin && !isReadOnly && (
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
                width: 32, height: 32, borderRadius: 7,
                border: `1px solid ${p === page ? C.accentBorder : C.border}`,
                background: p === page ? C.accentSoft : C.surface,
                color: p === page ? C.accent : C.muted,
                cursor: 'pointer', fontSize: '0.8125rem',
              }}
            >{p}</button>
          ))}
        </div>
      )}

      {toast && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem',
          padding: '0.625rem 1rem', borderRadius: 10,
          background: C.surface, border: `1px solid ${C.border}`,
          color: C.text, fontSize: '0.875rem',
          boxShadow: '0 4px 16px rgba(26,23,20,.1)',
          zIndex: 9999,
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}
