import { describe, it, expect } from 'vitest'
import { SexualSelectionAddon } from '@/simulation/addons/SexualSelectionAddon'
import { Level2Simulation } from '@/simulation/levels/level2/Level2Simulation'
import { Level1Simulation } from '@/simulation/levels/level1/Level1Simulation'
import { DEFAULT_LEVEL2_PARAMS } from '@/simulation/levels/level2/Level2SimulationParams'
import { DEFAULT_LEVEL1_PARAMS } from '@/simulation/levels/level1/Level1SimulationParams'
import { makePureLizard } from '@/simulation/levels/level2/Level2Lizard'
import { seedRng } from '@/simulation/stats/Rng'

function makeSim(overrides: Partial<typeof DEFAULT_LEVEL2_PARAMS> = {}): Level2Simulation {
  return new Level2Simulation({ ...DEFAULT_LEVEL2_PARAMS, ...overrides })
}

describe('SexualSelectionAddon — rare color advantage', () => {
  it('does not affect Level1Simulation (type guard)', () => {
    const addon = new SexualSelectionAddon()
    const sim = new Level1Simulation({ ...DEFAULT_LEVEL1_PARAMS })
    sim.initSimulation()
    const popBefore = sim.getLizards().length
    addon.prepare(sim)
    addon.apply(sim)
    expect(sim.getLizards().length).toBe(popBefore)
  })

  it('enabledSuccesses increments only when bonus caused reproduction', () => {
    seedRng(1)
    const addon = new SexualSelectionAddon({
      type: 'normal',
      params: { mean: 10, stddev: 0.001 },
    })
    // Base repro prob = 0 for all colors, so any reproduction is entirely bonus-driven
    const sim = makeSim({
      orangeBaseReproProb: 0,
      blueBaseReproProb: 0,
      yellowBaseReproProb: 0,
      deathDistribution: { type: 'normal', params: { mean: 0, stddev: 0.01 } },
      deathThreshold: 0.5,
      seed: 1,
    })
    sim.initSimulation()

    // Single-roll flow: prepare sets bonuses, tick rolls once, apply tracks
    addon.prepare(sim)
    sim.tick()
    addon.apply(sim)

    const total =
      addon.enabledSuccesses.orange +
      addon.enabledSuccesses.blue +
      addon.enabledSuccesses.yellow
    expect(total).toBeGreaterThan(0)
  })

  it('rare color receives higher per-lizard bonus rate than common color', () => {
    // 1 orange (freq≈0.01) vs 99 blue (freq≈0.99), bonus magnitude ≈ 1:
    //   orange prob ≈ 0 + 1×0.99 = 0.99 → high repro rate
    //   blue   prob ≈ 0 + 1×0.01 = 0.01 → low  repro rate
    const NUM_TRIALS = 20
    let orangeTotal = 0
    let blueTotal = 0

    for (let trial = 0; trial < NUM_TRIALS; trial++) {
      seedRng(trial + 1)
      const addon = new SexualSelectionAddon({
        type: 'normal',
        params: { mean: 1, stddev: 0.001 },
      })
      const sim = makeSim({
        neighborhoodRadius: 0,
        orangeBaseReproProb: 0,
        blueBaseReproProb: 0,
        yellowBaseReproProb: 0,
        // Very low death so the manual lizard list survives mostly intact
        deathDistribution: { type: 'normal', params: { mean: 0, stddev: 0.01 } },
        deathThreshold: 0.5,
        seed: trial + 1,
      })
      sim.initSimulation()

      // Override lizard list with 1 orange + 99 blue
      const lizards = [makePureLizard('orange', 50, 50)]
      for (let i = 0; i < 99; i++) {
        lizards.push(makePureLizard('blue', (i * 8) % 800, (i * 5) % 500))
      }
      sim['lizards'] = lizards
      sim['generation'] = 1

      // Full single-roll flow
      addon.prepare(sim)
      sim.tick()
      addon.apply(sim)

      orangeTotal += addon.enabledSuccesses.orange
      blueTotal   += addon.enabledSuccesses.blue
    }

    // Per-lizard rates: orange ≈ 0.99 per lizard, blue ≈ 0.01 per lizard
    const orangeRate = orangeTotal / NUM_TRIALS          // 1 orange per trial
    const blueRate   = blueTotal   / (NUM_TRIALS * 99)  // 99 blue per trial
    expect(orangeRate).toBeGreaterThan(blueRate * 5)
  })

  it('reset() clears cumulative counters', () => {
    const addon = new SexualSelectionAddon()
    addon.enabledSuccesses = { orange: 5, blue: 3, yellow: 2 }
    addon.reset()
    expect(addon.enabledSuccesses).toEqual({ orange: 0, blue: 0, yellow: 0 })
  })
})
