/**
 * Mulberry32 — fast, high-quality, seedable 32-bit PRNG.
 * Produces floats in [0, 1), identical sequence for the same seed.
 */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6D2B79F5) >>> 0
    let z = Math.imul(s ^ (s >>> 15), 1 | s)
    z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z
    return ((z ^ (z >>> 14)) >>> 0) / 0x100000000
  }
}

// Module-level RNG instance. Defaults to Math.random until seeded.
let _rng: () => number = () => Math.random()

/**
 * Seed the module-level RNG.
 * Pass 0 (or any falsy value) to reset to Math.random (non-reproducible).
 */
export function seedRng(seed: number): void {
  _rng = seed ? mulberry32(seed) : () => Math.random()
}

/** Drop-in replacement for Math.random(), uses the current RNG instance. */
export function rngRandom(): number {
  return _rng()
}
