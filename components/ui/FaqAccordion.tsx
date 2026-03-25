'use client'

import { useState } from 'react'
import type { FaqItem } from '@/lib/data/types'

type FaqAccordionProps = {
  items: FaqItem[]
  title?: string
}

export default function FaqAccordion({ items, title }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section aria-label={title ?? 'Questions fréquentes'}>
      {title && (
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(24px, 3vw, 36px)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-6)',
          }}
        >
          {title}
        </h2>
      )}

      <dl>
        {items.map((item, index) => {
          const isOpen = openIndex === index
          return (
            <div
              key={index}
              style={{
                borderBottom: '1px solid var(--border)',
                padding: 'var(--space-4) 0',
              }}
            >
              <dt>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggle(index)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 'var(--space-4)',
                    fontFamily: 'var(--font-primary)',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    lineHeight: 1.5,
                  }}
                >
                  {item.question}
                  <span
                    aria-hidden="true"
                    style={{
                      flexShrink: 0,
                      color: 'var(--accent-1)',
                      fontSize: '20px',
                      lineHeight: 1,
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s var(--ease-out)',
                    }}
                  >
                    +
                  </span>
                </button>
              </dt>

              {isOpen && (
                <dd
                  style={{
                    margin: 'var(--space-3) 0 0',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.75,
                    paddingRight: 'var(--space-8)',
                  }}
                >
                  {item.answer}
                </dd>
              )}
            </div>
          )
        })}
      </dl>
    </section>
  )
}
