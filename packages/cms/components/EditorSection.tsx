'use client'

import { useState, type ReactNode } from 'react'
import { C } from './editor-tokens'

interface Props {
  title: string
  badge?: string
  accent?: string
  defaultOpen?: boolean
  children: ReactNode
}

export function EditorSection({ title, badge, accent, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const barColor = accent ?? C.accent

  return (
    <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.75rem 1rem', background: 'transparent', border: 'none', borderBottom: open ? `1px solid ${C.border}` : 'none',
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <span style={{ width: 3, height: 16, borderRadius: 2, background: barColor, flexShrink: 0 }} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: C.text, letterSpacing: '-.01em' }}>{title}</span>
          {badge && (
            <span style={{ fontSize: '0.6875rem', color: C.dim, background: C.surface2, padding: '1px 7px', borderRadius: 10, fontWeight: 500 }}>
              {badge}
            </span>
          )}
        </div>
        <span style={{ fontSize: '0.75rem', color: C.dim, transition: 'transform .15s', transform: open ? 'rotate(0)' : 'rotate(-90deg)' }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {children}
        </div>
      )}
    </section>
  )
}
