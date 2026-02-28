import type { SimulationLevelParams } from '@/simulation/core/SimulationLevel'
import type { Distribution } from '@/simulation/stats/Distribution'

export interface Level2SimulationParams extends SimulationLevelParams {
  // Global params
  initialPopulation: number
  generationLimit: number
  tickRateMs: number
  maxPopulation: number
  extinctionGuardFactor: number
  extinctionThresholdRatio: number
  // Shared distributions
  bodySizeDistribution: Distribution
  deathDistribution: Distribution
  deathThreshold: number
  // Color base reproduction probabilities (P-M4)
  orangeBaseReproProb: number
  blueBaseReproProb: number
  yellowBaseReproProb: number
  // Neighborhood (P-M3)
  neighborhoodRadius: number
  yellowBonusPerOrangeNeighbor: number
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
  maxPopulation: 600,
  extinctionGuardFactor: 0.5,
  extinctionThresholdRatio: 0.1,
  bodySizeDistribution: { type: 'normal', params: { mean: 5, stddev: 1 } },
  deathDistribution: { type: 'normal', params: { mean: 0.5, stddev: 0.15 } },
  deathThreshold: 0.6,
  orangeBaseReproProb: 0.7,
  blueBaseReproProb: 0.5,
  yellowBaseReproProb: 0.25,
  neighborhoodRadius: 50,
  yellowBonusPerOrangeNeighbor: 0.05,
  discreteMode: false,
  mutationStddev: 0.05,
  worldWidth: 800,
  worldHeight: 500,
}
