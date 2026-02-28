import { SimulationLevel } from '@/simulation/core/SimulationLevel'
import type { Lizard } from '@/simulation/core/Lizard'
import type { MetricSnapshot } from '@/ui/adapters/UISimulationAdapter'
import Stats from '@/simulation/stats/Stats'
import { seedRng, rngRandom } from '@/simulation/stats/Rng'
import { Level2Lizard, makePureLizard, type LizardColor } from './Level2Lizard'
import { DEFAULT_LEVEL2_PARAMS, type Level2SimulationParams } from './Level2SimulationParams'
import { getNeighbors, countByDominantColor } from './Neighborhood'

export class Level2Simulation extends SimulationLevel {
  params: Level2SimulationParams

  private _maxPopReached = false
  private _extinctionGuardActive = false

  constructor(params?: Partial<Level2SimulationParams>) {
    super()
    this.params = { ...DEFAULT_LEVEL2_PARAMS, ...params }
  }

  initSimulation(): void {
    seedRng(this.params.seed || (Date.now() & 0xFFFFFFFF))
    this.generation = 0
    this._maxPopReached = false
    this._extinctionGuardActive = false
    this.lizards = []

    const perColor = Math.floor(this.params.initialPopulation / 3)
    const colors: LizardColor[] = ['orange', 'blue', 'yellow']
    for (const color of colors) {
      for (let i = 0; i < perColor; i++) {
        const x = rngRandom() * this.params.worldWidth
        const y = rngRandom() * this.params.worldHeight
        this.lizards.push(makePureLizard(color, x, y))
      }
    }
  }

  computeDeathProbability(_lizard: Lizard): number {
    return Stats.sample(this.params.deathDistribution)
  }

  computeReproductionProbability(lizard: Lizard): number {
    const l2 = lizard as Level2Lizard
    const allLizards = this.lizards as Level2Lizard[]
    const neighbors = getNeighbors(l2, allLizards, this.params.neighborhoodRadius)
    const neighborColors = countByDominantColor(neighbors)

    switch (l2.dominantColor) {
      case 'orange':
        return this.params.orangeBaseReproProb

      case 'blue':
        // Blocked when ≥1 orange within radius (P-M4)
        return neighborColors.orange === 0
          ? this.params.blueBaseReproProb
          : 0

      case 'yellow': {
        // Bonus proportional to orange neighbors (P-M4)
        const bonus = neighborColors.orange * this.params.yellowBonusPerOrangeNeighbor
        return Math.min(1, this.params.yellowBaseReproProb + bonus)
      }
    }
  }

  tick(): void {
    const allLizards = this.lizards as Level2Lizard[]

    // Reset ephemeral flags
    for (const l of allLizards) {
      l.lastTickReproduced = false
      l.isNewbornThisTick = false
    }

    // 1. Extinction guard (P-M1)
    const extinctionThreshold =
      this.params.extinctionThresholdRatio * this.params.initialPopulation
    this._extinctionGuardActive = allLizards.length < extinctionThreshold
    const effectiveDeathThreshold = this._extinctionGuardActive
      ? Math.min(1, this.params.deathThreshold + this.params.extinctionGuardFactor)
      : this.params.deathThreshold

    // 2. Death phase
    const survivors: Level2Lizard[] = []
    for (const lizard of allLizards) {
      const deathProb = this.computeDeathProbability(lizard)
      if (deathProb < effectiveDeathThreshold) survivors.push(lizard)
    }

    // 3. Reproduction phase
    const newborn: Level2Lizard[] = []
    for (const lizard of survivors) {
      const reproProb = this.computeReproductionProbability(lizard)
      if (rngRandom() < reproProb) {
        lizard.lastTickReproduced = true
        const x = rngRandom() * this.params.worldWidth
        const y = rngRandom() * this.params.worldHeight
        newborn.push(lizard.reproduce(this.params, x, y))
      }
    }

    // 4. Max population cap (P-M1)
    const available = Math.max(0, this.params.maxPopulation - survivors.length)
    const cappedNewborn = newborn.slice(0, available)
    this._maxPopReached = newborn.length > available

    // 5. Update and advance
    this.lizards = [...survivors, ...cappedNewborn]
    this.generation++
  }

  /**
   * Add extra lizards from an addon (e.g. SexualSelectionAddon).
   * Respects the max population cap.
   */
  addLizards(extra: Level2Lizard[]): void {
    const available = Math.max(0, this.params.maxPopulation - this.lizards.length)
    const capped = extra.slice(0, available)
    this.lizards = [...this.lizards, ...capped]
    if (extra.length > available) this._maxPopReached = true
  }

  /** Returns current lizards typed as Level2Lizard[]. */
  getLevel2Lizards(): Level2Lizard[] {
    return this.lizards as Level2Lizard[]
  }

  getMetrics(): MetricSnapshot {
    const lizards = this.lizards as Level2Lizard[]
    const totalPopulation = lizards.length
    const colorCounts = countByDominantColor(lizards)
    return {
      generation: this.generation,
      totalPopulation,
      populationByColor: colorCounts,
      maxPopReached: this._maxPopReached,
      extinctionGuardActive: this._extinctionGuardActive,
    }
  }
}
