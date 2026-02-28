import { Lizard } from '@/simulation/core/Lizard'
import Stats from '@/simulation/stats/Stats'
import type { Level1SimulationParams } from './Level1SimulationParams'

export class Level1Lizard extends Lizard {
  readonly bodySize: number
  readonly color: 'orange' = 'orange'

  /**
   * @param x - world x position
   * @param y - world y position
   * @param bodySizeOrParams - a fixed body size (number) or params to sample from
   */
  constructor(x: number, y: number, bodySizeOrParams: number | Level1SimulationParams) {
    super(x, y)
    if (typeof bodySizeOrParams === 'number') {
      this.bodySize = bodySizeOrParams
    } else {
      this.bodySize = Math.max(0.1, Stats.sample(bodySizeOrParams.bodySizeDistribution))
    }
  }

  /**
   * Produce an offspring with bodySize sampled from a normal distribution
   * centered on this lizard's bodySize ± mutationStddev.
   */
  reproduce(params: Level1SimulationParams, x: number, y: number): Level1Lizard {
    const offspringBodySize =
      params.mutationStddev > 0
        ? Stats.sample({
            type: 'normal',
            params: { mean: this.bodySize, stddev: params.mutationStddev },
          })
        : this.bodySize
    return new Level1Lizard(x, y, Math.max(0.1, offspringBodySize))
  }
}
