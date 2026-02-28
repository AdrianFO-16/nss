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
 *
 * Transitions:
 *   IDLE    → RUNNING  (play() — also calls initSimulation first)
 *   RUNNING → PAUSED   (pause())
 *   PAUSED  → RUNNING  (play())
 *   RUNNING → ENDED    (tick detects generation >= generationLimit)
 *   any     → IDLE     (restart())
 */
export class Player {
  private _simulation: SimulationLevel | null = null
  private _addons: Addon[] = []
  private _state: PlayerState = PlayerState.IDLE
  private _intervalId: ReturnType<typeof setInterval> | null = null

  onTick: ((result: PlayerTickResult) => void) | null = null
  /** Fired once after initSimulation(), before the first tick. */
  onInit: ((lizards: Lizard[]) => void) | null = null

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
    if (this._state === PlayerState.ENDED) return

    if (this._state === PlayerState.IDLE) {
      this._initSimulation()
    }

    if (this._state !== PlayerState.RUNNING) {
      this._state = PlayerState.RUNNING
      this._startLoop()
    }
  }

  pause(): void {
    if (this._state !== PlayerState.RUNNING) return
    this._state = PlayerState.PAUSED
    this._stopLoop()
  }

  restart(): void {
    this._stopLoop()
    this._state = PlayerState.IDLE
  }

  private _initSimulation(): void {
    if (!this._simulation) return
    this._simulation.initSimulation()
    this._addons.forEach(addon => addon.apply(this._simulation!))
    this.onInit?.(this._simulation.getLizards())
  }

  private _startLoop(): void {
    if (!this._simulation) return
    const intervalMs = this._simulation.params.tickRateMs
    this._intervalId = setInterval(() => {
      this._tickSimulation()
    }, intervalMs)
  }

  private _stopLoop(): void {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId)
      this._intervalId = null
    }
  }

  private _tickSimulation(): void {
    if (!this._simulation) return

    this._simulation.tick()

    for (const addon of this._addons) {
      addon.apply(this._simulation)
    }

    const metrics = this._simulation.getMetrics()
    const lizards = this._simulation.getLizards()

    if (this._simulation.generation >= this._simulation.params.generationLimit) {
      this._state = PlayerState.ENDED
      this._stopLoop()
    }

    this.onTick?.({
      lizards,
      generation: this._simulation.generation,
      metrics,
      playerState: this._state,
    })
  }
}
