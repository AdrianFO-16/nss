import type { SimulationLevelParams } from '@/simulation/core/SimulationLevel'
import type { Distribution } from '@/simulation/stats/Distribution'

export interface Level2SimulationParams extends SimulationLevelParams {
  // Shared distributions
  bodySizeDistribution: Distribution
  deathDistribution: Distribution
  // Color base reproduction probabilities (P-M4)
  orangeBaseReproProb: number
  blueBaseReproProb: number
  yellowBaseReproProb: number
  // Neighborhood (P-M3)
  neighborhoodRadius: number
  /** Max repro penalty applied to orange when invaded by yellow (ratio-based). */
  orangeYellowInvasionPenaltyMax: number
  /** Max repro bonus applied to yellow when surrounded by orange (ratio-based). */
  yellowOrangeBonusMax: number
  /** Radius within which offspring are spawned around their parent. */
  offspringSpread: number
  // Per-color extinction guard
  /** A color's count falls below (initialPopulation / 3) × this ratio to trigger its guard. */
  colorExtinctionThresholdRatio: number
  /** Minimum reproduction probability applied when a color's guard is active. */
  colorExtinctionReproFloor: number
  // Trait inheritance (P-M2)
  discreteMode: boolean
  mutationStddev: number
  // World bounds
  worldWidth: number
  worldHeight: number
}

export const DEFAULT_LEVEL2_PARAMS: Level2SimulationParams = {
  initialPopulation: 150,
  generationLimit: 200,
  tickRateMs: 500,
  seed: 0,
  // Population guards
  maxPopulation: 600,
  extinctionGuardFactor: 0.5,
  extinctionThresholdRatio: 0.1,
  deathThreshold: 0.6,
  bodySizeDistribution: { type: 'normal', params: { mean: 5, stddev: 1 } },
  deathDistribution: { type: 'normal', params: { mean: 0.5, stddev: 0.15 } },
  orangeBaseReproProb: 0.55,
  blueBaseReproProb: 0.50,
  yellowBaseReproProb: 0.40,
  neighborhoodRadius: 50,
  orangeYellowInvasionPenaltyMax: 0.40,
  yellowOrangeBonusMax: 0.50,
  offspringSpread: 60,
  colorExtinctionThresholdRatio: 0.10,
  colorExtinctionReproFloor: 0.40,
  discreteMode: false,
  mutationStddev: 0.05,
  worldWidth: 800,
  worldHeight: 500,
}
