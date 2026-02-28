import { SimulationLevel } from '@/simulation/core/SimulationLevel'
import type { Lizard } from '@/simulation/core/Lizard'
import type { MetricSnapshot } from '@/ui/adapters/UISimulationAdapter'
import Stats from '@/simulation/stats/Stats'
import { Level1Lizard } from './Level1Lizard'
import { DEFAULT_LEVEL1_PARAMS, type Level1SimulationParams } from './Level1SimulationParams'

export class Level1Simulation extends SimulationLevel {
  params: Level1SimulationParams

  private _maxPopReached = false
  private _extinctionGuardActive = false

  constructor(params?: Partial<Level1SimulationParams>) {
    super()
    this.params = { ...DEFAULT_LEVEL1_PARAMS, ...params }
  }

  initSimulation(): void {
    this.generation = 0
    this._maxPopReached = false
    this._extinctionGuardActive = false
    this.lizards = []
    for (let i = 0; i < this.params.initialPopulation; i++) {
      const x = Math.random() * this.params.worldWidth
      const y = Math.random() * this.params.worldHeight
      this.lizards.push(new Level1Lizard(x, y, this.params))
    }
  }

  computeDeathProbability(_lizard: Lizard): number {
    return Stats.sample(this.params.deathDistribution)
  }

  computeReproductionProbability(lizard: Lizard): number {
    const l1 = lizard as Level1Lizard
    const base = Stats.sample(this.params.reproductionDistribution)
    const allLizards = this.lizards as Level1Lizard[]
    const meanBodySize =
      allLizards.length > 0
        ? allLizards.reduce((s, l) => s + l.bodySize, 0) / allLizards.length
        : 1
    const scaleFactor = meanBodySize > 0 ? l1.bodySize / meanBodySize : 1
    return Math.min(1, Math.max(0, base * scaleFactor))
  }

  tick(): void {
    // 1. Extinction guard check (P-M1)
    const extinctionThreshold =
      this.params.extinctionThresholdRatio * this.params.initialPopulation
    this._extinctionGuardActive = this.lizards.length < extinctionThreshold
    const effectiveDeathThreshold = this._extinctionGuardActive
      ? Math.min(1, this.params.deathThreshold + this.params.extinctionGuardFactor)
      : this.params.deathThreshold

    // 2. Death phase
    const survivors: Lizard[] = []
    for (const lizard of this.lizards) {
      const deathProb = this.computeDeathProbability(lizard)
      if (deathProb < effectiveDeathThreshold) {
        survivors.push(lizard)
      }
    }

    // 3. Reproduction phase
    const newborn: Level1Lizard[] = []
    for (const lizard of survivors) {
      const reproProb = this.computeReproductionProbability(lizard)
      if (Math.random() < reproProb) {
        const parent = lizard as Level1Lizard
        const x = Math.random() * this.params.worldWidth
        const y = Math.random() * this.params.worldHeight
        newborn.push(parent.reproduce(this.params, x, y))
      }
    }

    // 4. Max population cap (P-M1)
    const available = Math.max(0, this.params.maxPopulation - survivors.length)
    const cappedNewborn = newborn.slice(0, available)
    this._maxPopReached = newborn.length > available

    // 5. Update lizard list and advance generation
    this.lizards = [...survivors, ...cappedNewborn]
    this.generation++
  }

  getMetrics(): MetricSnapshot {
    const lizards = this.lizards as Level1Lizard[]
    const totalPopulation = lizards.length
    const averageBodySize =
      totalPopulation > 0
        ? lizards.reduce((s, l) => s + l.bodySize, 0) / totalPopulation
        : 0
    return {
      generation: this.generation,
      totalPopulation,
      averageBodySize,
      maxPopReached: this._maxPopReached,
      extinctionGuardActive: this._extinctionGuardActive,
    }
  }
}
