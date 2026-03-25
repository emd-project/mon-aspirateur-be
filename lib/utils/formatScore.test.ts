import { describe, it, expect } from 'vitest'
import { formatScore, scoreLabel } from './formatScore'

describe('formatScore', () => {
  it('formats a score with one decimal', () => {
    expect(formatScore(91)).toBe('91.0')
    expect(formatScore(87.5)).toBe('87.5')
  })

  it('clamps to 0–100', () => {
    expect(formatScore(-5)).toBe('0.0')
    expect(formatScore(150)).toBe('100.0')
  })
})

describe('scoreLabel', () => {
  it('returns correct label for score ranges', () => {
    expect(scoreLabel(90)).toBe('Excellent')
    expect(scoreLabel(75)).toBe('Très bien')
    expect(scoreLabel(60)).toBe('Bien')
    expect(scoreLabel(45)).toBe('Correct')
    expect(scoreLabel(30)).toBe('Insuffisant')
  })
})
