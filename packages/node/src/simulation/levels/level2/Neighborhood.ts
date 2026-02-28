import type { Level2Lizard, LizardColor } from './Level2Lizard'

/**
 * Return all lizards (excluding `lizard` itself) within Euclidean distance `radius`.
 * Brute-force O(n²) — sufficient for MVP population sizes (P-M3).
 */
export function getNeighbors(
  lizard: Level2Lizard,
  all: Level2Lizard[],
  radius: number,
): Level2Lizard[] {
  const r2 = radius * radius
  const results: Level2Lizard[] = []
  for (const other of all) {
    if (other === lizard) continue
    const dx = other.x - lizard.x
    const dy = other.y - lizard.y
    if (dx * dx + dy * dy <= r2) {
      results.push(other)
    }
  }
  return results
}

/** Count lizards by their dominant color. */
export function countByDominantColor(
  lizards: Level2Lizard[],
): Record<LizardColor, number> {
  const counts: Record<LizardColor, number> = { orange: 0, blue: 0, yellow: 0 }
  for (const l of lizards) {
    counts[l.dominantColor]++
  }
  return counts
}
