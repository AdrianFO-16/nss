import type { Distribution } from './Distribution'

class NotImplementedError extends Error {
  constructor(method: string) {
    super(`Stats.${method} is not yet implemented — implement in Phase 2`)
    this.name = 'NotImplementedError'
  }
}

/**
 * Pure stateless service for distribution sampling and probability evaluation.
 * Methods are implemented in Phase 2. Skeletons throw to enforce the contract early.
 */
const Stats = {
  /**
   * Draw a random sample from the given distribution.
   * - normal: Box-Muller transform → mean + stddev * z
   * - exponential: inverse CDF → -ln(1 - U) / lambda
   */
  sample(_distribution: Distribution): number {
    throw new NotImplementedError('sample')
  },

  /**
   * Evaluate the probability density at `value` for the given distribution.
   * - normal: Gaussian PDF
   * - exponential: lambda * e^(-lambda * value) for value >= 0, else 0
   */
  getProbability(_distribution: Distribution, _value: number): number {
    throw new NotImplementedError('getProbability')
  },
}

export default Stats
