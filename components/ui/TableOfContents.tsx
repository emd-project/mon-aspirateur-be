'use client'

import { useState } from 'react'

type TocItem = { id: string; text: string }

export default function TableOfContents({ items }: { items: TocItem[] }) {
  const [open, setOpen] = useState(false)

  if (items.length === 0) return null

  return (
    <nav
      aria-label="Sommaire"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem 1.5rem',
        marginBottom: '2rem',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <span style={{
          fontFamily: 'var(--font-playfair), Georgia, serif',
          fontWeight: 700,
          fontSize: '1.1rem',
          color: 'var(--text-primary)',
        }}>
          Sommaire
        </span>
        <span style={{
          fontSize: '.75rem',
          fontWeight: 600,
          color: 'var(--accent-1)',
          letterSpacing: '.05em',
        }}>
          {open ? 'Masquer' : `${items.length} sections`}
        </span>
      </button>

      {open && (
        <ol style={{
          margin: '1rem 0 0',
          padding: '0 0 0 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '.5rem',
          listStyle: 'decimal',
        }}>
          {items.map((item) => (
            <li key={item.id} style={{ fontSize: '.875rem', color: 'var(--text-secondary)' }}>
              <a
                href={`#${item.id}`}
                style={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  transition: 'color .15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-1)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  )
}
