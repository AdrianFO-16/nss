import type { Lizard } from '@/simulation/core/Lizard'
import type { DisplayRenderer } from './DisplayRenderer'

/** Base hex colors for each lizard color. */
const BASE_COLORS = {
  orange: { r: 249, g: 115, b: 22  },  // #f97316
  blue:   { r: 59,  g: 130, b: 246 },  // #3b82f6
  yellow: { r: 234, g: 179, b: 8   },  // #eab308
  white:  { r: 245, g: 245, b: 245 },  // #f5f5f5
}

function toHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')
}

/**
 * Resolve fill color for a lizard.
 * - Level2Lizard: blend the three base colors using colorWeights (continuous mode)
 * - Otherwise: look up the color string property in BASE_COLORS
 */
function resolveColor(lizard: Lizard): string {
  const l = lizard as Lizard & { colorWeights?: { orange: number; blue: number; yellow: number }; color?: string }

  if (l.colorWeights) {
    const { orange, blue, yellow } = l.colorWeights
    const r = BASE_COLORS.orange.r * orange + BASE_COLORS.blue.r * blue + BASE_COLORS.yellow.r * yellow
    const g = BASE_COLORS.orange.g * orange + BASE_COLORS.blue.g * blue + BASE_COLORS.yellow.g * yellow
    const b = BASE_COLORS.orange.b * orange + BASE_COLORS.blue.b * blue + BASE_COLORS.yellow.b * yellow
    return toHex(r, g, b)
  }

  const colorKey = (l.color ?? 'white') as keyof typeof BASE_COLORS
  const c = BASE_COLORS[colorKey] ?? BASE_COLORS.white
  return toHex(c.r, c.g, c.b)
}

/** Fixed 4px for Level 2 lizards; scaled by bodySize for Level 1. */
function resolveRadius(lizard: Lizard): number {
  const l = lizard as Lizard & { colorWeights?: unknown; bodySize?: number }
  if (l.colorWeights !== undefined) return 4
  const bodySize = l.bodySize
  if (bodySize === undefined) return 4
  return Math.max(3, Math.min(8, Math.round(bodySize * 1.2)))
}

/**
 * Canvas 2D implementation of DisplayRenderer.
 * Draws each lizard as a filled circle.
 * Level 1: radius scales with bodySize, solid dominant color.
 * Level 2: fixed 4px radius, color blended from colorWeights (P-A6, Commit 8).
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
