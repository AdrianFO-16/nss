import { Simulation } from './Simulation'

/**
 * Params struct — concrete level params extend this.
 * Defined here inline for Phase 1; moved to level-specific files in Phase 2+.
 */
export interface SimulationLevelParams {
  initialPopulation: number
  generationLimit: number
  tickRateMs: number
}

/**
 * Abstract intermediate class between Simulation and concrete levels.
 * Adds param-awareness. Was mislabeled <<service>> in the original diagram (P-A2).
 */
export abstract class SimulationLevel extends Simulation {
  abstract params: SimulationLevelParams
  generation = 0
}
