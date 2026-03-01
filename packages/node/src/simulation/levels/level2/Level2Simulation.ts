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

  constructor(params?: Partial<Level2SimulationParams>) {
    super()
    this.params = { ...DEFAULT_LEVEL2_PARAMS, ...params }
  }

  initSimulation(): void {
    seedRng(this.params.seed || (Date.now() & 0xFFFFFFFF))
    this.generation = 0
    this.resetGuards()
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

    let base: number
    switch (l2.dominantColor) {
      case 'orange':
        base = this.params.orangeBaseReproProb
        break

      case 'blue':
        // Blocked when ≥1 orange within radius (P-M4)
        base = neighborColors.orange === 0 ? this.params.blueBaseReproProb : 0
        break

      case 'yellow': {
        // Bonus proportional to orange neighbors (P-M4)
        const neighborBonus = neighborColors.orange * this.params.yellowBonusPerOrangeNeighbor
        base = Math.min(1, this.params.yellowBaseReproProb + neighborBonus)
        break
      }
    }

    // Add sexual-selection bonus set by SexualSelectionAddon.prepare() (single roll, no double-roll)
    return Math.min(1, base! + l2.sexualSelectionBonus)
  }

  tick(): void {
    const allLizards = this.lizards as Level2Lizard[]

    // Reset ephemeral flags (bonus fields are reset by SexualSelectionAddon.prepare())
    for (const l of allLizards) {
      l.lastTickReproduced = false
      l.isNewbornThisTick = false
      l.lastReproductionRoll = 0
    }

    // 1. Extinction guard
    const effectiveDeathThreshold = this.checkExtinctionGuard()

    // 2. Death phase
    const survivors: Level2Lizard[] = []
    for (const lizard of allLizards) {
      if (this.computeDeathProbability(lizard) < effectiveDeathThreshold) {
        survivors.push(lizard)
      }
    }

    // 3. Reproduction phase — single roll, bonus already folded in via computeReproductionProbability
    const newborn: Level2Lizard[] = []
    for (const lizard of survivors) {
      const totalProb = this.computeReproductionProbability(lizard)
      const roll = rngRandom()
      lizard.lastReproductionRoll = roll
      if (roll < totalProb) {
        lizard.lastTickReproduced = true
        const x = rngRandom() * this.params.worldWidth
        const y = rngRandom() * this.params.worldHeight
        newborn.push(lizard.reproduce(this.params, x, y))
      }
    }

    // 4. Max population cap
    const cappedNewborn = this.applyPopulationCap(survivors, newborn)

    // 5. Update and advance
    this.lizards = [...survivors, ...cappedNewborn]
    this.generation++
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
