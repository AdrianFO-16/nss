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
 *
 * Two-phase lifecycle per tick (no double-roll):
 *
 *  prepare()  — runs BEFORE simulation.tick().
 *    Computes per-color frequencies, then for each eligible lizard (not a
 *    newborn from the previous tick) stores:
 *      • sexualSelectionBaseReproProb — base prob without bonus (for accounting)
 *      • sexualSelectionBonus         — rare-color bonus = magnitude × (1 − freq)
 *    Level2Simulation.computeReproductionProbability() adds this bonus, so the
 *    simulation's own roll already includes the sexual-selection pressure.
 *
 *  apply()  — runs AFTER simulation.tick().
 *    Checks lizards that reproduced: if their lastReproductionRoll fell in
 *    [sexualSelectionBaseReproProb, totalProb) the bonus was the deciding
 *    factor → increment enabledSuccesses[color].
 *
 *  reset()  — called on initSimulation() to clear cumulative counters.
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

  /** Pre-tick: compute and store per-lizard bonuses for the upcoming single roll. */
  prepare(simulation: SimulationLevel): void {
    if (!(simulation instanceof Level2Simulation)) return

    const lizards = simulation.getLevel2Lizards()
    const total = lizards.length
    if (total === 0) return

    // Per-color frequency
    const colorCounts: ColorCounters = { orange: 0, blue: 0, yellow: 0 }
    for (const l of lizards) colorCounts[l.dominantColor]++
    const freq: Record<LizardColor, number> = {
      orange: colorCounts.orange / total,
      blue:   colorCounts.blue   / total,
      yellow: colorCounts.yellow / total,
    }

    for (const lizard of lizards) {
      // Reset from previous tick
      lizard.sexualSelectionBonus = 0
      lizard.sexualSelectionBaseReproProb = 0

      // Skip lizards born last tick — they haven't been alive a full generation
      if (lizard.isNewbornThisTick) continue

      // Store the base prob (before bonus) for enabled-success accounting in apply()
      // At this point lizard.sexualSelectionBonus is still 0, so computeReproductionProbability
      // returns the unmodified base prob.
      lizard.sexualSelectionBaseReproProb =
        simulation.computeReproductionProbability(lizard)

      // Bonus inversely proportional to frequency — rarer = larger bonus (P-M5)
      const bonusMagnitude = Math.max(0, Stats.sample(this.bonusDistribution))
      lizard.sexualSelectionBonus = bonusMagnitude * (1 - freq[lizard.dominantColor])
    }
  }

  /**
   * Post-tick: scan reproduced lizards and count those for whom the bonus was
   * the deciding factor (roll fell in the gap [baseProb, baseProb + bonus)).
   * No new reproduction roll is performed here.
   */
  apply(simulation: SimulationLevel): void {
    if (!(simulation instanceof Level2Simulation)) return

    const lizards = simulation.getLevel2Lizards()
    for (const lizard of lizards) {
      if (!lizard.lastTickReproduced || lizard.sexualSelectionBonus <= 0) continue

      const color = lizard.dominantColor
      // The roll was stored during the single tick reproduction check.
      // If roll >= baseProb → the bonus (not the base prob) was the deciding factor.
      if (lizard.lastReproductionRoll >= lizard.sexualSelectionBaseReproProb) {
        this.enabledSuccesses[color]++
      }
    }
  }
}
