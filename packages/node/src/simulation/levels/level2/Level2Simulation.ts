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

  private _tickColorCounts: Record<LizardColor, number> = { orange: 0, blue: 0, yellow: 0 }
  private _colorExtinctionGuardActive: Record<LizardColor, boolean> = { orange: false, blue: false, yellow: false }

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

    const neighborTotal = neighbors.length

    let base: number
    switch (l2.dominantColor) {
      case 'orange': {
        const yellowRatio = neighborTotal > 0 ? neighborColors.yellow / neighborTotal : 0
        const invasionPenalty = yellowRatio * this.params.orangeYellowInvasionPenaltyMax
        base = Math.max(0, this.params.orangeBaseReproProb - invasionPenalty)
        break
      }

      case 'blue':
        base = this.params.blueBaseReproProb
        if (neighborColors.blue === 0 && neighborColors.orange > 0) {
          base = 0
        }
        break

      case 'yellow': {
        const orangeRatio = neighborTotal > 0 ? neighborColors.orange / neighborTotal : 0
        const neighborBonus = orangeRatio * this.params.yellowOrangeBonusMax
        base = Math.min(1, this.params.yellowBaseReproProb + neighborBonus)
        break
      }
    }

    // Per-color extinction guard: lift base to floor if color is critically low
    if (this._colorExtinctionGuardActive[l2.dominantColor]) {
      base = Math.max(base!, this.params.colorExtinctionReproFloor)
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

    // 1. Extinction guard (global) + per-color guard
    const effectiveDeathThreshold = this.checkExtinctionGuard()
    const perColorThreshold = Math.floor(
      (this.params.initialPopulation / 3) * this.params.colorExtinctionThresholdRatio
    )
    this._tickColorCounts = countByDominantColor(allLizards)
    const colors: LizardColor[] = ['orange', 'blue', 'yellow']
    for (const c of colors) {
      this._colorExtinctionGuardActive[c] = this._tickColorCounts[c] < perColorThreshold
    }

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
        const angle = rngRandom() * Math.PI * 2
        const dist = rngRandom() * this.params.offspringSpread
        const x = Math.max(0, Math.min(this.params.worldWidth,  lizard.x + Math.cos(angle) * dist))
        const y = Math.max(0, Math.min(this.params.worldHeight, lizard.y + Math.sin(angle) * dist))
        newborn.push(lizard.reproduce(this.params, x, y))
      }
    }

    // 4. Shuffle newborns so no color monopolises cap slots by list order
    for (let i = newborn.length - 1; i > 0; i--) {
      const j = Math.floor(rngRandom() * (i + 1))
      ;[newborn[i], newborn[j]] = [newborn[j], newborn[i]]
    }

    // 5. Max population cap
    const cappedNewborn = this.applyPopulationCap(survivors, newborn)

    // 6. Update and advance
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
      colorExtinctionGuardActive: { ...this._colorExtinctionGuardActive },
    }
  }
}
