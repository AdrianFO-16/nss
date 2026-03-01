import type { SimulationLevelParams } from '@/simulation/core/SimulationLevel'
import type { Distribution } from '@/simulation/stats/Distribution'

export interface Level1SimulationParams extends SimulationLevelParams {
  // Level 1 specific
  bodySizeDistribution: Distribution
  deathDistribution: Distribution
  reproductionDistribution: Distribution
  mutationStddev: number
  // World bounds for lizard positioning (updated by UI canvas size)
  worldWidth: number
  worldHeight: number
}

export const DEFAULT_LEVEL1_PARAMS: Level1SimulationParams = {
  // Global
  initialPopulation: 100,
  generationLimit: 100,
  tickRateMs: 500,
  seed: 0,
  // Population guards
  maxPopulation: 500,
  extinctionGuardFactor: 0.5,
  extinctionThresholdRatio: 0.1,
  deathThreshold: 0.6,
  // Body size
  bodySizeDistribution: { type: 'normal', params: { mean: 5, stddev: 1 } },
  // Death
  deathDistribution: { type: 'normal', params: { mean: 0.5, stddev: 0.15 } },
  // Reproduction
  reproductionDistribution: { type: 'normal', params: { mean: 0.5, stddev: 0.1 } },
  mutationStddev: 0.1,
  // World bounds
  worldWidth: 800,
  worldHeight: 500,
}
