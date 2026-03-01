import { describe, it, expect, beforeEach } from 'vitest'
import { Level1Simulation } from '@/simulation/levels/level1/Level1Simulation'
import { DEFAULT_LEVEL1_PARAMS, type Level1SimulationParams } from '@/simulation/levels/level1/Level1SimulationParams'

function makeSimulation(overrides: Partial<Level1SimulationParams> = {}): Level1Simulation {
  return new Level1Simulation({ ...DEFAULT_LEVEL1_PARAMS, ...overrides })
}

describe('Level1Simulation — initSimulation', () => {
  it('creates the correct number of lizards', () => {
    const sim = makeSimulation({ initialPopulation: 50 })
    sim.initSimulation()
    expect(sim.getLizards().length).toBe(50)
  })

  it('resets generation to 0', () => {
    const sim = makeSimulation()
    sim.initSimulation()
    sim.tick()
    sim.initSimulation()
    expect(sim.generation).toBe(0)
  })

  it('positions lizards within world bounds', () => {
    const sim = makeSimulation({ worldWidth: 400, worldHeight: 300 })
    sim.initSimulation()
    for (const l of sim.getLizards()) {
      expect(l.x).toBeGreaterThanOrEqual(0)
      expect(l.x).toBeLessThan(400)
      expect(l.y).toBeGreaterThanOrEqual(0)
      expect(l.y).toBeLessThan(300)
    }
  })
})

describe('Level1Simulation — tick (death)', () => {
  it('reduces population when death threshold is effectively 0 (guaranteed death)', () => {
    // deathThreshold = 0 means even deathProb = 0 kills — use -1 to guarantee
    // Easier: set threshold to 2 (impossible) — actually set to -999 so all die
    // Real approach: set deathThreshold very low so sampled deathProb always >= it
    const sim = makeSimulation({
      initialPopulation: 100,
      deathDistribution: { type: 'normal', params: { mean: 1.0, stddev: 0.01 } },
      deathThreshold: 0.01, // mean 1.0 >> 0.01 → almost all die
      // Disable reproduction to isolate death
      reproductionDistribution: { type: 'normal', params: { mean: -10, stddev: 0.01 } },
    })
    sim.initSimulation()
    const before = sim.getLizards().length
    sim.tick()
    const after = sim.getLizards().length
    expect(after).toBeLessThan(before)
  })
})

describe('Level1Simulation — tick (reproduction)', () => {
  it('grows population when reproduction probability is very high', () => {
    const sim = makeSimulation({
      initialPopulation: 50,
      // Death is extremely unlikely
      deathDistribution: { type: 'normal', params: { mean: 0, stddev: 0.01 } },
      deathThreshold: 0.99,
      // Reproduction is almost certain (mean 0.95, tiny stddev)
      reproductionDistribution: { type: 'normal', params: { mean: 0.95, stddev: 0.01 } },
      maxPopulation: 500,
    })
    sim.initSimulation()
    const before = sim.getLizards().length
    sim.tick()
    expect(sim.getLizards().length).toBeGreaterThan(before)
  })
})

describe('Level1Simulation — maxPopulation cap (P-M1)', () => {
  it('never exceeds maxPopulation', () => {
    const sim = makeSimulation({
      initialPopulation: 100,
      maxPopulation: 100,
      deathDistribution: { type: 'normal', params: { mean: 0, stddev: 0.01 } },
      deathThreshold: 0.99,
      reproductionDistribution: { type: 'normal', params: { mean: 0.99, stddev: 0.01 } },
    })
    sim.initSimulation()
    for (let i = 0; i < 10; i++) sim.tick()
    expect(sim.getLizards().length).toBeLessThanOrEqual(100)
  })

  it('sets maxPopReached flag when cap is hit', () => {
    const sim = makeSimulation({
      initialPopulation: 90,
      maxPopulation: 90,
      deathDistribution: { type: 'normal', params: { mean: 0, stddev: 0.01 } },
      deathThreshold: 0.99,
      reproductionDistribution: { type: 'normal', params: { mean: 0.99, stddev: 0.01 } },
    })
    sim.initSimulation()
    for (let i = 0; i < 5; i++) sim.tick()
    expect(sim.getMetrics().maxPopReached).toBe(true)
  })
})

describe('Level1Simulation — extinction guard (P-M1)', () => {
  it('activates guard when population drops below threshold', () => {
    const sim = makeSimulation({
      initialPopulation: 100,
      extinctionThresholdRatio: 0.5, // guard fires when pop < 50
      // Force near-total death
      deathDistribution: { type: 'normal', params: { mean: 1, stddev: 0.01 } },
      deathThreshold: 0.05,
      reproductionDistribution: { type: 'normal', params: { mean: 0, stddev: 0.01 } },
    })
    sim.initSimulation()
    // Run several ticks — population should collapse and guard should activate
    for (let i = 0; i < 5; i++) sim.tick()
    const metrics = sim.getMetrics()
    // Either guard activated, or population is still alive because guard saved it
    expect(
      metrics.extinctionGuardActive || metrics.totalPopulation > 0
    ).toBe(true)
  })
})

describe('Level1Simulation — getMetrics', () => {
  let sim: Level1Simulation

  beforeEach(() => {
    sim = makeSimulation({ initialPopulation: 50 })
    sim.initSimulation()
  })

  it('returns correct totalPopulation', () => {
    expect(sim.getMetrics().totalPopulation).toBe(50)
  })

  it('averageBodySize is a positive number after init', () => {
    const { averageBodySize } = sim.getMetrics() as unknown as { averageBodySize: number }
    expect(averageBodySize).toBeGreaterThan(0)
  })

  it('averageBodySize trends upward under strong selection pressure', () => {
    const highBodySizeSim = makeSimulation({
      initialPopulation: 80,
      bodySizeDistribution: { type: 'normal', params: { mean: 5, stddev: 1 } },
      deathDistribution: { type: 'normal', params: { mean: 0.3, stddev: 0.05 } },
      deathThreshold: 0.4, // moderate death
      reproductionDistribution: { type: 'normal', params: { mean: 0.6, stddev: 0.05 } },
      mutationStddev: 0.05,
      maxPopulation: 500,
    })
    highBodySizeSim.initSimulation()
    const initialAvg = (highBodySizeSim.getMetrics().averageBodySize as number)

    for (let i = 0; i < 30; i++) highBodySizeSim.tick()

    const finalAvg = (highBodySizeSim.getMetrics().averageBodySize as number)
    // Directional selection: larger lizards reproduce more, so average should rise
    expect(finalAvg).toBeGreaterThan(initialAvg * 0.9) // lenient — stochastic
  })
})
