import type { Distribution } from './Distribution'

/**
 * Pure stateless service for distribution sampling and probability evaluation.
 * Exported as a singleton object — no state, no side effects.
 */
const Stats = {
  /**
   * Draw a random sample from the given distribution.
   * - normal:      Box-Muller transform → mean + stddev * z
   * - exponential: inverse CDF → -ln(1 - U) / lambda
   */
  sample(distribution: Distribution): number {
    const { type, params } = distribution

    if (type === 'normal') {
      const { mean = 0, stddev = 1 } = params
      if (stddev <= 0) throw new RangeError('Stats.sample: stddev must be > 0 for normal distribution')
      // Box-Muller — use 1 - random() to guard against log(0)
      const u1 = 1 - Math.random()
      const u2 = 1 - Math.random()
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
      return mean + stddev * z
    }

    if (type === 'exponential') {
      const { lambda = 1 } = params
      if (lambda <= 0) throw new RangeError('Stats.sample: lambda must be > 0 for exponential distribution')
      return -Math.log(1 - Math.random()) / lambda
    }

    throw new RangeError(`Stats.sample: unknown distribution type "${type}"`)
  },

  /**
   * Evaluate the probability density at `value` for the given distribution.
   * - normal:      Gaussian PDF — (1 / (σ√2π)) * e^(-½((x-μ)/σ)²)
   * - exponential: λ * e^(-λx) for x ≥ 0, else 0
   */
  getProbability(distribution: Distribution, value: number): number {
    const { type, params } = distribution

    if (type === 'normal') {
      const { mean = 0, stddev = 1 } = params
      if (stddev <= 0) throw new RangeError('Stats.getProbability: stddev must be > 0 for normal distribution')
      const z = (value - mean) / stddev
      return (1 / (stddev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z)
    }

    if (type === 'exponential') {
      const { lambda = 1 } = params
      if (lambda <= 0) throw new RangeError('Stats.getProbability: lambda must be > 0 for exponential distribution')
      if (value < 0) return 0
      return lambda * Math.exp(-lambda * value)
    }

    throw new RangeError(`Stats.getProbability: unknown distribution type "${type}"`)
  },
}

export default Stats
