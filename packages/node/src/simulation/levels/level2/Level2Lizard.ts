import { Lizard } from '@/simulation/core/Lizard'
import Stats from '@/simulation/stats/Stats'
import type { Level2SimulationParams } from './Level2SimulationParams'

export type LizardColor = 'orange' | 'blue' | 'yellow'

export interface ColorWeights {
  orange: number
  blue: number
  yellow: number
}

export class Level2Lizard extends Lizard {
  colorWeights: ColorWeights
  /** Reset to false at tick start; set true if this lizard reproduces. */
  lastTickReproduced = false
  /** Set true when spawned within a tick; used to skip newborns in prepare(). */
  isNewbornThisTick = false
  // ── Sexual-selection fields — written by SexualSelectionAddon.prepare() ──
  /** Base reproduction probability before the bonus (for enabled-success accounting). */
  sexualSelectionBaseReproProb = 0
  /** Bonus added to base prob; folded into computeReproductionProbability(). */
  sexualSelectionBonus = 0
  /** The actual RNG roll used for the reproduction decision this tick. */
  lastReproductionRoll = 0

  constructor(x: number, y: number, colorWeights: ColorWeights) {
    super(x, y)
    this.colorWeights = colorWeights
  }

  /** The color with the highest weight. */
  get dominantColor(): LizardColor {
    const { orange, blue, yellow } = this.colorWeights
    if (orange >= blue && orange >= yellow) return 'orange'
    if (blue >= orange && blue >= yellow) return 'blue'
    return 'yellow'
  }

  /** Used by Canvas2DRenderer — returns dominant color for discrete rendering. */
  get color(): LizardColor {
    return this.dominantColor
  }

  /**
   * Produce an offspring.
   * - discreteMode: offspring inherits parent dominant color at weight 1.0
   * - continuous: weights sampled from narrow normal around parent, re-normalised
   */
  reproduce(params: Level2SimulationParams, x: number, y: number): Level2Lizard {
    let weights: ColorWeights

    if (params.discreteMode) {
      const dom = this.dominantColor
      weights = { orange: 0, blue: 0, yellow: 0 }
      weights[dom] = 1.0
    } else {
      const stddev = Math.max(0.01, params.mutationStddev)
      const rawOrange = Math.max(0, Stats.sample({ type: 'normal', params: { mean: this.colorWeights.orange, stddev } }))
      const rawBlue   = Math.max(0, Stats.sample({ type: 'normal', params: { mean: this.colorWeights.blue,   stddev } }))
      const rawYellow = Math.max(0, Stats.sample({ type: 'normal', params: { mean: this.colorWeights.yellow, stddev } }))
      const total = rawOrange + rawBlue + rawYellow || 1
      weights = {
        orange: rawOrange / total,
        blue:   rawBlue   / total,
        yellow: rawYellow / total,
      }
    }

    const offspring = new Level2Lizard(x, y, weights)
    offspring.isNewbornThisTick = true
    return offspring
  }
}

/** Build a Level2Lizard whose dominant color is the given one (weight 1.0). */
export function makePureLizard(color: LizardColor, x: number, y: number): Level2Lizard {
  const weights: ColorWeights = { orange: 0, blue: 0, yellow: 0 }
  weights[color] = 1.0
  return new Level2Lizard(x, y, weights)
}
