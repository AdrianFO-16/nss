import type { Lizard } from '@/simulation/core/Lizard'
import type { DisplayRenderer } from './DisplayRenderer'

/** Color map from lizard color property to hex — extended in Phase 2/3 */
const COLOR_MAP: Record<string, string> = {
  orange: '#f97316',
  blue: '#3b82f6',
  yellow: '#eab308',
  white: '#f5f5f5',
}

function resolveColor(lizard: Lizard): string {
  const colorProp = (lizard as Lizard & { color?: string }).color
  return COLOR_MAP[colorProp ?? 'white'] ?? '#f5f5f5'
}

function resolveRadius(lizard: Lizard): number {
  const bodySize = (lizard as Lizard & { bodySize?: number }).bodySize
  if (bodySize === undefined) return 4
  return Math.max(3, Math.min(8, Math.round(bodySize * 1.2)))
}

/**
 * Canvas 2D implementation of DisplayRenderer.
 * Draws each lizard as a filled circle. Radius scales with bodySize when present.
 */
export const Canvas2DRenderer: DisplayRenderer = {
  clear(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  },

  render(lizards: Lizard[], canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    Canvas2DRenderer.clear(canvas)

    for (const lizard of lizards) {
      const radius = resolveRadius(lizard)
      ctx.beginPath()
      ctx.arc(lizard.x, lizard.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = resolveColor(lizard)
      ctx.fill()
    }
  },
}
