/**
 * Formats a score (0–100) to a display string.
 * Uses oldstyle numerics via CSS class typo-score.
 */
export const formatScore = (score: number): string => {
  const clamped = Math.min(100, Math.max(0, score))
  return clamped.toFixed(1)
}

/**
 * Returns a label for a score range.
 */
export const scoreLabel = (score: number): string => {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Très bien'
  if (score >= 55) return 'Bien'
  if (score >= 40) return 'Correct'
  return 'Insuffisant'
}
