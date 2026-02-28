import { Simulation } from './Simulation'
import type { Lizard } from './Lizard'
import type { MetricSnapshot } from '@/ui/adapters/UISimulationAdapter'

/**
 * Base params struct — concrete level params extend this.
 */
export interface SimulationLevelParams {
  initialPopulation: number
  generationLimit: number
  tickRateMs: number
}

/**
 * Abstract intermediate class between Simulation and concrete levels (P-A2).
 * Adds param-awareness and the metrics/lizard-access contract used by Player.
 */
export abstract class SimulationLevel extends Simulation {
  abstract params: SimulationLevelParams
  generation = 0

  /** Returns a shallow copy of the current lizard list for Player and UI consumption. */
  getLizards(): Lizard[] {
    return [...this.lizards]
  }

  /** Returns a metrics snapshot for the current tick. Implemented by each concrete level. */
  abstract getMetrics(): MetricSnapshot
}
