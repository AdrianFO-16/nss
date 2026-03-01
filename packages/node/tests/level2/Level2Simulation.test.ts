import { describe, it, expect } from 'vitest'
import { Level2Simulation } from '@/simulation/levels/level2/Level2Simulation'
import { DEFAULT_LEVEL2_PARAMS, type Level2SimulationParams } from '@/simulation/levels/level2/Level2SimulationParams'
import { makePureLizard } from '@/simulation/levels/level2/Level2Lizard'
import { seedRng } from '@/simulation/stats/Rng'

function makeSim(overrides: Partial<Level2SimulationParams> = {}): Level2Simulation {
  return new Level2Simulation({ ...DEFAULT_LEVEL2_PARAMS, ...overrides })
}

describe('Level2Simulation — initSimulation', () => {
  it('spawns approximately initialPopulation/3 per color', () => {
    const sim = makeSim({ initialPopulation: 150 })
    sim.initSimulation()
    const lizards = sim.getLevel2Lizards()
    expect(lizards.length).toBe(150)
    const orange = lizards.filter(l => l.dominantColor === 'orange').length
    const blue   = lizards.filter(l => l.dominantColor === 'blue').length
    const yellow = lizards.filter(l => l.dominantColor === 'yellow').length
    expect(orange).toBe(50)
    expect(blue).toBe(50)
    expect(yellow).toBe(50)
  })

  it('positions lizards within world bounds', () => {
    const sim = makeSim({ worldWidth: 400, worldHeight: 300 })
    sim.initSimulation()
    for (const l of sim.getLevel2Lizards()) {
      expect(l.x).toBeGreaterThanOrEqual(0)
      expect(l.x).toBeLessThan(400)
      expect(l.y).toBeGreaterThanOrEqual(0)
      expect(l.y).toBeLessThan(300)
    }
  })
})

describe('Level2Simulation — RPS mechanics', () => {
  it('blue reproduction is blocked when orange neighbor is within radius', () => {
    // Place one orange and one blue lizard very close (within radius)
    const sim = new Level2Simulation({
      ...DEFAULT_LEVEL2_PARAMS,
      neighborhoodRadius: 100,
      blueBaseReproProb: 1.0,
      orangeBaseReproProb: 0,
      yellowBaseReproProb: 0,
    })
    // Manually inject lizards
    const orange = makePureLizard('orange', 50, 50)
    const blue   = makePureLizard('blue',   55, 55)
    sim['lizards'] = [orange, blue]

    const blueReproProb = sim.computeReproductionProbability(blue)
    expect(blueReproProb).toBe(0)
  })

  it('blue reproduction is unblocked when no orange neighbor within radius', () => {
    const sim = new Level2Simulation({
      ...DEFAULT_LEVEL2_PARAMS,
      neighborhoodRadius: 10,
      blueBaseReproProb: 0.5,
    })
    const orange = makePureLizard('orange', 200, 200) // far away
    const blue   = makePureLizard('blue',   10,  10)
    sim['lizards'] = [orange, blue]

    const blueReproProb = sim.computeReproductionProbability(blue)
    expect(blueReproProb).toBe(0.5)
  })

  it('yellow receives bonus proportional to orange neighbor count', () => {
    const sim = new Level2Simulation({
      ...DEFAULT_LEVEL2_PARAMS,
      neighborhoodRadius: 100,
      yellowBaseReproProb: 0.25,
      yellowBonusPerOrangeNeighbor: 0.1,
    })
    const yellow  = makePureLizard('yellow', 50, 50)
    const orange1 = makePureLizard('orange', 55, 50)
    const orange2 = makePureLizard('orange', 50, 55)
    sim['lizards'] = [yellow, orange1, orange2]

    const yellowReproProb = sim.computeReproductionProbability(yellow)
    expect(yellowReproProb).toBeCloseTo(0.45, 5) // 0.25 + 2 × 0.1
  })

  it('over 100 ticks dominant color changes — validates RPS cycle', { retry: 3 }, () => {
    // Fixed seed for reproducibility; retry up to 3× for inherent stochasticity.
    // Large neighborhood radius puts all lizards in mutual range.
    // Phase 1: Yellow gets huge bonus from orange neighbors → yellow overtakes orange.
    // Phase 2: Orange disappears → yellow bonus collapses → blue unblocked (0.8) → blue overtakes.
    // Phase 3: Blue outgrows → cycle continues.
    seedRng(42)
    const sim = makeSim({
      seed: 42,
      initialPopulation: 90,
      neighborhoodRadius: 1000,    // all lizards are each other's neighbors
      orangeBaseReproProb: 0.5,
      blueBaseReproProb: 0.8,
      yellowBaseReproProb: 0.1,
      yellowBonusPerOrangeNeighbor: 0.05,
      deathDistribution: { type: 'normal', params: { mean: 0.45, stddev: 0.15 } },
      deathThreshold: 0.5,
      maxPopulation: 600,
    })
    sim.initSimulation()

    const dominants: string[] = []
    for (let i = 0; i < 100; i++) {
      sim.tick()
      const metrics = sim.getMetrics()
      const byColor = metrics.populationByColor as { orange: number; blue: number; yellow: number }
      if (metrics.totalPopulation === 0) break
      const dom = (Object.entries(byColor) as [string, number][]).reduce((a, b) => a[1] >= b[1] ? a : b)[0]
      dominants.push(dom)
    }

    // RPS dynamics: dominant color must shift at least once across 100 ticks
    const uniqueDominants = new Set(dominants)
    expect(uniqueDominants.size).toBeGreaterThan(1)
  })

  it('respects max population cap across all colors', () => {
    const cap = 60
    const sim = makeSim({
      initialPopulation: 60,
      maxPopulation: cap,
      // Very high reproduction to trigger cap
      orangeBaseReproProb: 1.0,
      blueBaseReproProb: 1.0,
      yellowBaseReproProb: 1.0,
      deathDistribution: { type: 'normal', params: { mean: 0.1, stddev: 0.01 } },
      deathThreshold: 0.5,
    })
    sim.initSimulation()
    for (let i = 0; i < 5; i++) sim.tick()
    expect(sim.getLizards().length).toBeLessThanOrEqual(cap)
  })
})

describe('Level2Simulation — discrete mode', () => {
  it('offspring inherit parent dominant color at weight 1.0', () => {
    const sim = makeSim({ discreteMode: true })
    sim.initSimulation()
    const orange = makePureLizard('orange', 50, 50)
    const offspring = orange.reproduce(sim.params, 60, 60)
    expect(offspring.colorWeights.orange).toBe(1.0)
    expect(offspring.colorWeights.blue).toBe(0)
    expect(offspring.colorWeights.yellow).toBe(0)
  })
})

describe('Level2Simulation — getMetrics', () => {
  it('returns populationByColor with correct counts', () => {
    const sim = makeSim()
    sim.initSimulation()
    const metrics = sim.getMetrics()
    const byColor = metrics.populationByColor as { orange: number; blue: number; yellow: number }
    expect(byColor.orange + byColor.blue + byColor.yellow).toBe(metrics.totalPopulation)
  })

  it('maxPopReached flag lights up when cap is hit', () => {
    const sim = makeSim({
      initialPopulation: 30,
      maxPopulation: 30,
      orangeBaseReproProb: 1.0,
      blueBaseReproProb: 1.0,
      yellowBaseReproProb: 1.0,
      deathDistribution: { type: 'normal', params: { mean: 0, stddev: 0.01 } },
      deathThreshold: 0.5,
    })
    sim.initSimulation()
    sim.tick()
    const metrics = sim.getMetrics()
    expect(metrics.maxPopReached).toBe(true)
  })
})
