import { describe, it, expect } from 'vitest'
import { Level1Lizard } from '@/simulation/levels/level1/Level1Lizard'
import { DEFAULT_LEVEL1_PARAMS } from '@/simulation/levels/level1/Level1SimulationParams'

describe('Level1Lizard', () => {
  it('constructs with a sampled bodySize when given params', () => {
    const lizard = new Level1Lizard(0, 0, DEFAULT_LEVEL1_PARAMS)
    expect(typeof lizard.bodySize).toBe('number')
    expect(lizard.bodySize).toBeGreaterThan(0)
  })

  it('constructs with a fixed bodySize when given a number', () => {
    const lizard = new Level1Lizard(10, 20, 7.5)
    expect(lizard.bodySize).toBe(7.5)
    expect(lizard.x).toBe(10)
    expect(lizard.y).toBe(20)
  })

  it('color is always orange', () => {
    const lizard = new Level1Lizard(0, 0, DEFAULT_LEVEL1_PARAMS)
    expect(lizard.color).toBe('orange')
  })

  it('reproduce() returns a new lizard with bodySize close to parent', () => {
    const parent = new Level1Lizard(0, 0, 5)
    const offspring = parent.reproduce(DEFAULT_LEVEL1_PARAMS, 10, 10)
    expect(offspring).toBeInstanceOf(Level1Lizard)
    // With mutationStddev=0.1, offspring should be within 3σ of parent (±0.3)
    expect(offspring.bodySize).toBeGreaterThan(4)
    expect(offspring.bodySize).toBeLessThan(6.5)
  })

  it('reproduce() offspring bodySize is always > 0', () => {
    const parent = new Level1Lizard(0, 0, 0.15)
    for (let i = 0; i < 50; i++) {
      const offspring = parent.reproduce(DEFAULT_LEVEL1_PARAMS, 0, 0)
      expect(offspring.bodySize).toBeGreaterThan(0)
    }
  })

  it('reproduce() with mutationStddev=0 returns parent bodySize exactly', () => {
    const parent = new Level1Lizard(0, 0, 5)
    const params = { ...DEFAULT_LEVEL1_PARAMS, mutationStddev: 0 }
    const offspring = parent.reproduce(params, 0, 0)
    expect(offspring.bodySize).toBe(5)
  })
})
