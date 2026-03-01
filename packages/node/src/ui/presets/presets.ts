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
    seed: 12345,
    level1Params: {
      initialPopulation: 100,
      generationLimit: 100,
      tickRateMs: 300,
      bodySizeDistribution: { type: 'normal', params: { mean: 5, stddev: 1 } },
      reproductionDistribution: { type: 'normal', params: { mean: 0.6, stddev: 0.23 } },
      deathDistribution: {
        type: 'normal',
        params: {
          mean: 0.5,
          stddev: 0.2,
        },
      },
      mutationStddev: 0.1,
      deathThreshold: 0.55,
    },
  },

  // ── Level 2 ───────────────────────────────────────────────────────────────
  {
    id: 'l2-rps-cycle',
    name: 'RPS Cycle',
    description: 'Balanced params that drive a visible yellow → blue → orange dominance cycle',
    level: 2,
    seed: 1231231250,
    level2Params: {
      deathDistribution: {
        type: 'normal',
        params: {
          mean: 0.5,
          stddev: 0.2,
        },
      },
      deathThreshold: 0.6,
      initialPopulation: 90,
      generationLimit: 500,
      tickRateMs: 200,
      orangeBaseReproProb: 0.6,
      blueBaseReproProb: 0.5,
      yellowBaseReproProb: 0.4,
      neighborhoodRadius: 50,
      yellowOrangeBonusMax: 0.45,
      orangeYellowInvasionPenaltyMax: 0.55,
      offspringSpread: 65,
      colorExtinctionReproFloor: 0.4,
      colorExtinctionThresholdRatio: 0.1,
      discreteMode: false,
      mutationStddev: 0.05
    },
  },
]

export function getPresetsForLevel(level: SimLevel): Preset[] {
  return PRESETS.filter(p => p.level === level)
}
