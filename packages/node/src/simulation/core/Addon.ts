import type { SimulationLevel } from './SimulationLevel'

/**
 * Abstract addon contract (P-A1).
 *
 * Lifecycle per tick (orchestrated by Player):
 *   1. prepare(simulation) — runs BEFORE simulation.tick().
 *      Use this to compute and store per-lizard state (e.g. bonuses) so the
 *      simulation's own reproduction roll can include them.  Default: no-op.
 *   2. simulation.tick() — single roll per lizard, bonus already folded in.
 *   3. apply(simulation) — runs AFTER simulation.tick().
 *      Use this to track outcomes. No second reproduction roll here.
 *
 * Lifecycle on init (orchestrated by Player):
 *   reset(simulation) — called once after initSimulation(), before onInit fires.
 *      Use this to clear cumulative counters etc.  Default: no-op.
 */
export abstract class Addon {
  /** Pre-tick hook — compute and store per-lizard state before the tick rolls. */
  prepare(_simulation: SimulationLevel): void {}

  /** Post-tick hook — track outcomes; do NOT re-roll reproduction here. */
  abstract apply(simulation: SimulationLevel): void

  /** Called after initSimulation() to reset addon state for a fresh run. */
  reset(): void {}
}
