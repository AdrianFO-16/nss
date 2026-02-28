import type { SimulationLevel } from './SimulationLevel'

/**
 * Abstract addon contract (P-A1).
 * Player calls addon.apply(simulation) after each simulation.tick().
 * Concrete addons (e.g. SexualSelectionAddon in Phase 3) extend this.
 */
export abstract class Addon {
  abstract apply(simulation: SimulationLevel): void
}
