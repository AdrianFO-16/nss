import { describe, it, expect } from 'vitest'
import { makePureLizard, Level2Lizard } from '@/simulation/levels/level2/Level2Lizard'
import { getNeighbors, countByDominantColor } from '@/simulation/levels/level2/Neighborhood'

describe('getNeighbors', () => {
  it('returns lizards within radius', () => {
    const center = makePureLizard('orange', 0, 0)
    const near   = makePureLizard('blue',   3, 4)   // distance = 5
    const far    = makePureLizard('yellow', 10, 10)  // distance ≈ 14.1
    const all = [center, near, far]
    const neighbors = getNeighbors(center, all, 6)
    expect(neighbors).toContain(near)
    expect(neighbors).not.toContain(far)
  })

  it('excludes self', () => {
    const center = makePureLizard('orange', 0, 0)
    const neighbors = getNeighbors(center, [center], 100)
    expect(neighbors).toHaveLength(0)
  })

  it('returns empty array when none in range', () => {
    const center = makePureLizard('orange', 0, 0)
    const far    = makePureLizard('blue', 100, 100)
    const neighbors = getNeighbors(center, [center, far], 10)
    expect(neighbors).toHaveLength(0)
  })

  it('includes lizard exactly on the boundary (distance === radius)', () => {
    const center = makePureLizard('orange', 0, 0)
    // 3-4-5 triangle: distance exactly 5
    const onBoundary = makePureLizard('blue', 3, 4)
    const neighbors = getNeighbors(center, [center, onBoundary], 5)
    expect(neighbors).toContain(onBoundary)
  })
})

describe('countByDominantColor', () => {
  it('counts lizards by dominant color', () => {
    const lizards: Level2Lizard[] = [
      makePureLizard('orange', 0, 0),
      makePureLizard('orange', 1, 1),
      makePureLizard('blue',   2, 2),
      makePureLizard('yellow', 3, 3),
    ]
    const counts = countByDominantColor(lizards)
    expect(counts.orange).toBe(2)
    expect(counts.blue).toBe(1)
    expect(counts.yellow).toBe(1)
  })

  it('returns zeros for empty array', () => {
    const counts = countByDominantColor([])
    expect(counts).toEqual({ orange: 0, blue: 0, yellow: 0 })
  })
})
