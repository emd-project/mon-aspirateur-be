import { describe, it, expect, vi, afterEach } from 'vitest'
import { currentYear } from './year'

describe('currentYear', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the current year as a number', () => {
    const year = currentYear()
    expect(typeof year).toBe('number')
    expect(year).toBeGreaterThanOrEqual(2024)
  })

  it('matches new Date().getFullYear()', () => {
    const now = new Date('2026-03-25T00:00:00Z')
    vi.setSystemTime(now)
    expect(currentYear()).toBe(2026)
  })
})
