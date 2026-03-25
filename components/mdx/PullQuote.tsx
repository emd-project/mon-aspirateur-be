type PullQuoteProps = { children: React.ReactNode }

export default function PullQuote({ children }: PullQuoteProps) {
  return (
    <blockquote style={{
      margin: '2.5rem 0',
      padding: '0 0 0 1.5rem',
      borderLeft: '3px solid var(--accent-1)',
    }}>
      <p style={{
        fontFamily: 'var(--font-playfair), Georgia, serif',
        fontStyle: 'italic',
        fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
        lineHeight: 1.5,
        color: 'var(--text-primary)',
        margin: 0,
      }}>
        {children}
      </p>
    </blockquote>
  )
}
