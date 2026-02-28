import type { Addon } from './Addon'
import type { Lizard } from './Lizard'
import type { SimulationLevel } from './SimulationLevel'
import type { MetricSnapshot } from '@/ui/adapters/UISimulationAdapter'
import { PlayerState } from './PlayerState'

export interface PlayerTickResult {
  lizards: Lizard[]
  generation: number
  metrics: MetricSnapshot
  playerState: PlayerState
}

/**
 * State machine that orchestrates the simulation loop.
 * Transitions: IDLE → RUNNING → PAUSED ↔ RUNNING → ENDED
 * Fully implemented in Phase 2.
 */
export class Player {
  private _simulation: SimulationLevel | null = null
  private _addons: Addon[] = []
  private _state: PlayerState = PlayerState.IDLE
  private _intervalId: ReturnType<typeof setInterval> | null = null

  onTick: ((result: PlayerTickResult) => void) | null = null

  get state(): PlayerState {
    return this._state
  }

  get addons(): Addon[] {
    return this._addons
  }

  set addons(addons: Addon[]) {
    this._addons = addons
  }

  setSimulation(simulation: SimulationLevel): void {
    this._simulation = simulation
  }

  play(): void {
    // Implemented in Phase 2
  }

  pause(): void {
    // Implemented in Phase 2
  }

  restart(): void {
    // Implemented in Phase 2
    this._state = PlayerState.IDLE
  }

  private initSimulation(): void {
    // Implemented in Phase 2
  }

  private tickSimulation(): void {
    // Implemented in Phase 2
  }

  // Prevent TS unused-private complaints until Phase 2 implements these
  private _unused = { init: this.initSimulation, tick: this.tickSimulation }
}
