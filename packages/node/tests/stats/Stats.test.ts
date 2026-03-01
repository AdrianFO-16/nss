import { describe, it, expect } from 'vitest'
import Stats from '@/simulation/stats/Stats'
import type { Distribution } from '@/simulation/stats/Distribution'

/**
 * Contract tests for Stats service.
 * These tests FAIL in Phase 1 — that is intentional.
 * They define the interface Stats must satisfy; all must pass after Phase 2
 * implements Stats.sample() and Stats.getProbability().
 */

const normalDist: Distribution = { type: 'normal', params: { mean: 5, stddev: 1 } }
const exponentialDist: Distribution = { type: 'exponential', params: { lambda: 0.5 } }

describe('Stats.sample()', () => {
  it('returns a number for a normal distribution', () => {
    const result = Stats.sample(normalDist)
    expect(typeof result).toBe('number')
    expect(isNaN(result)).toBe(false)
  })

  it('returns a non-negative value for an exponential distribution', () => {
    const result = Stats.sample(exponentialDist)
    expect(result).toBeGreaterThanOrEqual(0)
  })

  it('samples cluster near the mean for normal distribution (statistical)', () => {
    const samples = Array.from({ length: 200 }, () => Stats.sample(normalDist))
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length
    expect(mean).toBeGreaterThan(3)
    expect(mean).toBeLessThan(7)
  })

  it('throws on zero stddev for normal distribution', () => {
    const badDist: Distribution = { type: 'normal', params: { mean: 5, stddev: 0 } }
    expect(() => Stats.sample(badDist)).toThrow()
  })

  it('throws on negative lambda for exponential distribution', () => {
    const badDist: Distribution = { type: 'exponential', params: { lambda: -1 } }
    expect(() => Stats.sample(badDist)).toThrow()
  })
})

describe('Stats.getProbability()', () => {
  it('returns highest probability at the mean for normal distribution', () => {
    const atMean = Stats.getProbability(normalDist, 5)
    const offMean = Stats.getProbability(normalDist, 8)
    expect(atMean).toBeGreaterThan(offMean)
  })

  it('returns a positive value at the mean for normal distribution', () => {
    const result = Stats.getProbability(normalDist, 5)
    expect(result).toBeGreaterThan(0)
  })

  it('returns highest probability near 0 for exponential distribution', () => {
    const nearZero = Stats.getProbability(exponentialDist, 0.1)
    const farFromZero = Stats.getProbability(exponentialDist, 5)
    expect(nearZero).toBeGreaterThan(farFromZero)
  })

  it('returns 0 for negative values in exponential distribution', () => {
    const result = Stats.getProbability(exponentialDist, -1)
    expect(result).toBe(0)
  })

  it('returns a number for normal distribution at arbitrary value', () => {
    const result = Stats.getProbability(normalDist, 3)
    expect(typeof result).toBe('number')
    expect(isNaN(result)).toBe(false)
  })
})
