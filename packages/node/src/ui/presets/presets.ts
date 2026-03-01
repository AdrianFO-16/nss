import type { SimLevel } from '@/ui/hooks/usePlayer'
import type { Level1SimulationParams } from '@/simulation/levels/level1/Level1SimulationParams'
import type { Level2SimulationParams } from '@/simulation/levels/level2/Level2SimulationParams'

export interface Preset {
  id: string
  name: string
  description: string
  level: SimLevel
  seed: number
  level1Params?: Partial<Level1SimulationParams>
  level2Params?: Partial<Level2SimulationParams>
}

export const PRESETS: Preset[] = [
  // ── Level 1 ───────────────────────────────────────────────────────────────
  {
    id: 'l1-strong-selection',
    name: 'Strong Directional Selection',
    description: 'High repro advantage for large body sizes; visible trait shift',
    level: 1,
    seed: 42,
    level1Params: {
      initialPopulation: 100,
      generationLimit: 150,
      tickRateMs: 300,
      bodySizeDistribution: { type: 'normal', params: { mean: 5, stddev: 1.5 } },
      reproductionDistribution: { type: 'normal', params: { mean: 0.6, stddev: 0.1 } },
      mutationStddev: 0.3,
      deathThreshold: 0.55,
    },
  },
  {
    id: 'l1-neutral-drift',
    name: 'Neutral Drift',
    description: 'Weak selection — body size drifts randomly over generations',
    level: 1,
    seed: 1337,
    level1Params: {
      initialPopulation: 60,
      generationLimit: 200,
      tickRateMs: 200,
      bodySizeDistribution: { type: 'normal', params: { mean: 5, stddev: 0.5 } },
      reproductionDistribution: { type: 'normal', params: { mean: 0.5, stddev: 0.05 } },
      mutationStddev: 0.05,
      deathThreshold: 0.5,
    },
  },
  {
    id: 'l1-high-mutation',
    name: 'High Mutation',
    description: 'Large mutation stddev; wide distribution spread each generation',
    level: 1,
    seed: 7,
    level1Params: {
      initialPopulation: 80,
      generationLimit: 100,
      tickRateMs: 400,
      bodySizeDistribution: { type: 'normal', params: { mean: 5, stddev: 2 } },
      mutationStddev: 1.0,
      deathThreshold: 0.6,
    },
  },

  // ── Level 2 ───────────────────────────────────────────────────────────────
  {
    id: 'l2-classic-rps',
    name: 'Classic RPS',
    description: 'Default neighbourhood radius; balanced RPS oscillation',
    level: 2,
    seed: 99,
    level2Params: {
      initialPopulation: 150,
      generationLimit: 200,
      tickRateMs: 400,
      neighborhoodRadius: 50,
      orangeBaseReproProb: 0.7,
      blueBaseReproProb: 0.5,
      yellowBaseReproProb: 0.25,
      yellowBonusPerOrangeNeighbor: 0.05,
    },
  },
  {
    id: 'l2-local-neighborhoods',
    name: 'Local Neighborhoods',
    description: 'Small radius → strong spatial clustering of colors',
    level: 2,
    seed: 256,
    level2Params: {
      initialPopulation: 150,
      generationLimit: 200,
      tickRateMs: 400,
      neighborhoodRadius: 20,
      orangeBaseReproProb: 0.65,
      blueBaseReproProb: 0.55,
      yellowBaseReproProb: 0.3,
      yellowBonusPerOrangeNeighbor: 0.08,
    },
  },
  {
    id: 'l2-yellow-advantage',
    name: 'Yellow Advantage',
    description: 'High yellow bonus per orange neighbor; yellow dominates faster',
    level: 2,
    seed: 512,
    level2Params: {
      initialPopulation: 150,
      generationLimit: 200,
      tickRateMs: 350,
      neighborhoodRadius: 60,
      orangeBaseReproProb: 0.6,
      blueBaseReproProb: 0.5,
      yellowBaseReproProb: 0.2,
      yellowBonusPerOrangeNeighbor: 0.15,
    },
  },
]

export function getPresetsForLevel(level: SimLevel): Preset[] {
  return PRESETS.filter(p => p.level === level)
}
