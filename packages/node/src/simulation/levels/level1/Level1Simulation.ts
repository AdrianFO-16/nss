import { SimulationLevel } from '@/simulation/core/SimulationLevel'
import type { MetricSnapshot } from '@/ui/adapters/UISimulationAdapter'
import Stats from '@/simulation/stats/Stats'
import { seedRng, rngRandom } from '@/simulation/stats/Rng'
import { Level1Lizard } from './Level1Lizard'
import { DEFAULT_LEVEL1_PARAMS, type Level1SimulationParams } from './Level1SimulationParams'
import type { Lizard } from '@/simulation/core/Lizard'

export class Level1Simulation extends SimulationLevel {
  params: Level1SimulationParams

  constructor(params?: Partial<Level1SimulationParams>) {
    super()
    this.params = { ...DEFAULT_LEVEL1_PARAMS, ...params }
  }

  initSimulation(): void {
    seedRng(this.params.seed || (Date.now() & 0xFFFFFFFF))
    this.generation = 0
    this.resetGuards()
    this.lizards = []
    for (let i = 0; i < this.params.initialPopulation; i++) {
      const x = rngRandom() * this.params.worldWidth
      const y = rngRandom() * this.params.worldHeight
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
    // 1. Extinction guard
    const effectiveDeathThreshold = this.checkExtinctionGuard()

    // 2. Death phase
    const survivors: Lizard[] = []
    for (const lizard of this.lizards) {
      if (this.computeDeathProbability(lizard) < effectiveDeathThreshold) {
        survivors.push(lizard)
      }
    }

    // 3. Reproduction phase
    const newborn: Level1Lizard[] = []
    for (const lizard of survivors) {
      if (rngRandom() < this.computeReproductionProbability(lizard)) {
        const parent = lizard as Level1Lizard
        const x = rngRandom() * this.params.worldWidth
        const y = rngRandom() * this.params.worldHeight
        newborn.push(parent.reproduce(this.params, x, y))
      }
    }

    // 4. Max population cap
    const cappedNewborn = this.applyPopulationCap(survivors, newborn)

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
