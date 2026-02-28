import { Addon } from '@/simulation/core/Addon'
import type { SimulationLevel } from '@/simulation/core/SimulationLevel'
import Stats from '@/simulation/stats/Stats'
import type { Distribution } from '@/simulation/stats/Distribution'
import { Level2Simulation } from '@/simulation/levels/level2/Level2Simulation'
import type { LizardColor } from '@/simulation/levels/level2/Level2Lizard'

export interface ColorCounters {
  orange: number
  blue: number
  yellow: number
}

/**
 * Level 3 addon — sexual selection by rare-color advantage (P-M5).
 * Runs after simulation.tick() each generation.
 * For each surviving lizard that did NOT reproduce this tick, draws a
 * frequency-based bonus: bonus = sample(bonusDistribution) × (1 − frequency_c)
 * Rarer colors get a larger bonus. If the bonus pushes their roll over the
 * reproduction threshold, they reproduce and enabledSuccesses[color] is incremented.
 */
export class SexualSelectionAddon extends Addon {
  bonusDistribution: Distribution
  enabledSuccesses: ColorCounters = { orange: 0, blue: 0, yellow: 0 }

  constructor(bonusDistribution?: Distribution) {
    super()
    this.bonusDistribution = bonusDistribution ?? {
      type: 'normal',
      params: { mean: 0.3, stddev: 0.1 },
    }
  }

  reset(): void {
    this.enabledSuccesses = { orange: 0, blue: 0, yellow: 0 }
  }

  apply(simulation: SimulationLevel): void {
    if (!(simulation instanceof Level2Simulation)) return

    const lizards = simulation.getLevel2Lizards()
    const total = lizards.length
    if (total === 0) return

    // Compute per-color frequency
    const colorCounts: ColorCounters = { orange: 0, blue: 0, yellow: 0 }
    for (const l of lizards) colorCounts[l.dominantColor]++
    const freq: Record<LizardColor, number> = {
      orange: colorCounts.orange / total,
      blue:   colorCounts.blue   / total,
      yellow: colorCounts.yellow / total,
    }

    const extraOffspring = []

    for (const lizard of lizards) {
      // Skip lizards that already reproduced or were just born this tick
      if (lizard.lastTickReproduced || lizard.isNewbornThisTick) continue

      const color = lizard.dominantColor
      // Bonus inversely proportional to frequency — rarer = larger bonus (P-M5)
      const bonusMagnitude = Math.max(0, Stats.sample(this.bonusDistribution))
      const bonus = bonusMagnitude * (1 - freq[color])
      // Base repro prob for this color
      const baseProb = simulation.computeReproductionProbability(lizard)
      const totalProb = Math.min(1, baseProb + bonus)

      if (Math.random() < totalProb) {
        // Would have failed without the bonus — count as enabled success
        if (Math.random() >= baseProb) {
          this.enabledSuccesses[color]++
        }
        const x = Math.random() * simulation.params.worldWidth
        const y = Math.random() * simulation.params.worldHeight
        extraOffspring.push(lizard.reproduce(simulation.params, x, y))
        lizard.lastTickReproduced = true
      }
    }

    if (extraOffspring.length > 0) {
      simulation.addLizards(extraOffspring)
    }
  }
}
