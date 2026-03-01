import { Simulation } from './Simulation'
import type { Lizard } from './Lizard'
import type { MetricSnapshot } from '@/ui/adapters/UISimulationAdapter'

/**
 * Base params struct — concrete level params extend this.
 * Guard-related fields live here so SimulationLevel can enforce them uniformly.
 */
export interface SimulationLevelParams {
  initialPopulation: number
  generationLimit: number
  tickRateMs: number
  /** RNG seed. 0 = non-reproducible (uses Date.now() at init time). */
  seed: number
  // ── Population guards (P-M1) ─────────────────────────────────────────────
  maxPopulation: number
  extinctionGuardFactor: number
  extinctionThresholdRatio: number
  deathThreshold: number
}

/**
 * Abstract intermediate class between Simulation and concrete levels (P-A2).
 * Owns guard state and the cap/guard helpers so every level gets them for free.
 */
export abstract class SimulationLevel extends Simulation {
  abstract params: SimulationLevelParams
  generation = 0

  protected _maxPopReached = false
  protected _extinctionGuardActive = false

  // ── Guard helpers ─────────────────────────────────────────────────────────

  /** Reset guard flags — call at the top of initSimulation(). */
  protected resetGuards(): void {
    this._maxPopReached = false
    this._extinctionGuardActive = false
  }

  /**
   * Evaluate the extinction guard for the current population and return the
   * effective death threshold to use in the death phase.
   * Call at the start of tick(), before the death loop.
   */
  protected checkExtinctionGuard(): number {
    const threshold =
      this.params.extinctionThresholdRatio * this.params.initialPopulation
    this._extinctionGuardActive = this.lizards.length < threshold
    return this._extinctionGuardActive
      ? Math.min(1, this.params.deathThreshold + this.params.extinctionGuardFactor)
      : this.params.deathThreshold
  }

  /**
   * Apply the max-population cap to a newborn list.
   * Sets _maxPopReached and returns the capped slice.
   * Call after the reproduction phase, before updating this.lizards.
   */
  protected applyPopulationCap(survivors: Lizard[], newborn: Lizard[]): Lizard[] {
    const available = Math.max(0, this.params.maxPopulation - survivors.length)
    const capped = newborn.slice(0, available)
    this._maxPopReached = newborn.length > available
    return capped
  }

  /**
   * Add extra lizards from an addon (e.g. SexualSelectionAddon).
   * Respects the max population cap and updates _maxPopReached.
   */
  addLizards(extra: Lizard[]): void {
    const available = Math.max(0, this.params.maxPopulation - this.lizards.length)
    const capped = extra.slice(0, available)
    this.lizards = [...this.lizards, ...capped]
    if (extra.length > available) this._maxPopReached = true
  }

  // ── Lizard access ─────────────────────────────────────────────────────────

  /** Shallow copy of the current lizard list for Player and UI consumption. */
  getLizards(): Lizard[] {
    return [...this.lizards]
  }

  /** Returns a metrics snapshot for the current tick. Implemented by each level. */
  abstract getMetrics(): MetricSnapshot
}
