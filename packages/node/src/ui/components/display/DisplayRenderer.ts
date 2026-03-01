import type { Lizard } from '@/simulation/core/Lizard'

/**
 * Swappable renderer interface (P-A6).
 * Canvas2DRenderer implements this for MVP. A future three.js renderer
 * can be dropped in without touching OrganismDisplay.
 */
export interface DisplayRenderer {
  render(lizards: Lizard[], canvas: HTMLCanvasElement): void
  clear(canvas: HTMLCanvasElement): void
}
