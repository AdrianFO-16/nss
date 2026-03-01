import { useEffect, useRef } from 'react'
import type { Lizard } from '@/simulation/core/Lizard'
import type { DisplayRenderer } from './DisplayRenderer'

interface OrganismDisplayProps {
  lizards: Lizard[]
  renderer: DisplayRenderer
  className?: string
}

/**
 * Canvas wrapper component. Accepts a DisplayRenderer — swap for three.js
 * renderer in a future iteration without touching this component.
 */
export function OrganismDisplay({ lizards, renderer, className }: OrganismDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeObserver = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      renderer.render(lizards, canvas)
    })

    resizeObserver.observe(canvas)

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    renderer.render(lizards, canvas)

    return () => resizeObserver.disconnect()
  }, [lizards, renderer])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  )
}
