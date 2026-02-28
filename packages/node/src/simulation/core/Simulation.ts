import type { Lizard } from './Lizard'

/**
 * Abstract base simulation class.
 * Holds the lizard list as a protected field — concrete levels extend SimulationLevel,
 * which extends this. Diagram composition is expressed at SimulationLevel (P-A3).
 */
export abstract class Simulation {
  protected lizards: Lizard[] = []

  abstract computeDeathProbability(lizard: Lizard): number
  abstract computeReproductionProbability(lizard: Lizard): number
  abstract initSimulation(): void
  abstract tick(): void
}
