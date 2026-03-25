'use client'

import { useState } from 'react'
import type { FaqItem } from '@/lib/data/types'

type FaqAccordionProps = {
  items: FaqItem[]
  title?: string
}

export default function FaqAccordion({ items, title = 'Questions fréquentes' }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section aria-label={title}>
      {/* En-tête */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{
          fontSize: '.7rem',
          fontWeight: 700,
          letterSpacing: '.16em',
          textTransform: 'uppercase',
          color: 'var(--accent-1)',
          marginBottom: '.4rem',
        }}>
          FAQ
        </p>
        <h2 style={{
          fontFamily: 'var(--font-playfair), Georgia, serif',
          fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: 0,
          lineHeight: 1.2,
        }}>
          {title}
        </h2>
      </div>

      {/* Items */}
      <dl style={{ margin: 0 }}>
        {items.map((item, index) => {
          const isOpen = openIndex === index
          return (
            <div
              key={index}
              style={{
                borderTop: '1px solid var(--border-light)',
              }}
            >
              <dt>
                <h3 style={{ margin: 0, fontWeight: 'inherit' }}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggle(index)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    padding: '1rem 0',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1.5rem',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-playfair), Georgia, serif',
                    fontSize: 'clamp(1rem, 2vw, 1.1rem)',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    lineHeight: 1.4,
                  }}>
                    {item.question}
                  </span>
                  <span
                    aria-hidden="true"
                    style={{
                      flexShrink: 0,
                      width: '22px',
                      height: '22px',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '.8rem',
                      fontWeight: 700,
                      color: isOpen ? 'var(--accent-1)' : 'var(--text-muted)',
                      borderColor: isOpen ? 'var(--accent-1)' : 'var(--border-medium)',
                      transition: 'color .15s, border-color .15s',
                      lineHeight: 1,
                    }}
                  >
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                </h3>
              </dt>

              {isOpen && (
                <dd style={{
                  margin: '0',
                  paddingBottom: '1.25rem',
                  paddingRight: '2.5rem',
                  fontSize: '.9rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.75,
                }}>
                  {item.answer}
                </dd>
              )}
            </div>
          )
        })}
        {/* Bordure basse */}
        <div style={{ borderTop: '1px solid var(--border-light)' }} />
      </dl>
    </section>
  )
}
