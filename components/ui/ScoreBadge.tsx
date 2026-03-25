import { formatScore, scoreLabel } from '@/lib/utils/formatScore'

type ScoreBadgeProps = {
  score: number
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZE = {
  sm: { fontSize: '12px', padding: '2px 8px', dotSize: 8 },
  md: { fontSize: '14px', padding: '4px 12px', dotSize: 10 },
  lg: { fontSize: '16px', padding: '6px 16px', dotSize: 12 },
}

export default function ScoreBadge({ score, label, size = 'md' }: ScoreBadgeProps) {
  const { fontSize, padding } = SIZE[size]
  const displayLabel = label ?? scoreLabel(score)

  const color =
    score >= 85
      ? 'var(--success)'
      : score >= 70
        ? 'var(--accent-1)'
        : score >= 55
          ? 'var(--warning)'
          : 'var(--error)'

  return (
    <span
      role="img"
      aria-label={`Score : ${formatScore(score)}/100 — ${displayLabel}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding,
        background: 'var(--bg-surface-2)',
        border: `1px solid ${color}`,
        borderRadius: 'var(--radius-full)',
        fontSize,
        fontWeight: 700,
        color,
      }}
    >
      <span className="typo-score">{formatScore(score)}</span>
      <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.85em' }}>
        {displayLabel}
      </span>
    </span>
  )
}
