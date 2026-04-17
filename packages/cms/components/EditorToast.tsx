'use client'

import { useEffect } from 'react'
import { C } from './editor-tokens'

interface Props {
  message: string
  type: 'success' | 'error'
  onDone: () => void
}

export function Toast({ message, type, onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        padding: '0.625rem 1rem',
        borderRadius: 10,
        background: type === 'success' ? C.successSoft : C.errorSoft,
        border: `1px solid ${type === 'success' ? C.successBorder : C.errorBorder}`,
        color: type === 'success' ? C.success : C.error,
        fontSize: '0.875rem',
        fontWeight: 500,
        zIndex: 9999,
        boxShadow: '0 4px 16px rgba(26,23,20,.1)',
      }}
    >
      {message}
    </div>
  )
}
