import { useEffect, useRef } from 'react'
import { OrganismDisplay } from '@/ui/components/display/OrganismDisplay'
import { Canvas2DRenderer } from '@/ui/components/display/Canvas2DRenderer'
import type { Lizard } from '@/simulation/core/Lizard'

interface OrganismPanelProps {
  lizards?: Lizard[]
  onWorldResize?: (width: number, height: number) => void
}

export function OrganismPanel({ lizards = [], onWorldResize }: OrganismPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el || !onWorldResize) return

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      onWorldResize(Math.floor(width), Math.floor(height))
    })
    ro.observe(el)

    // Fire immediately with current size
    const { offsetWidth, offsetHeight } = el
    if (offsetWidth > 0 && offsetHeight > 0) {
      onWorldResize(offsetWidth, offsetHeight)
    }

    return () => ro.disconnect()
  }, [onWorldResize])

  return (
    <div className="flex h-full flex-col rounded-lg border border-nss-border bg-nss-surface p-3">
      <span className="mb-2 text-xs font-semibold uppercase tracking-widest text-nss-muted">
        Organism Display
      </span>
      <div ref={containerRef} className="relative min-h-0 flex-1 overflow-hidden rounded bg-nss-bg">
        <OrganismDisplay lizards={lizards} renderer={Canvas2DRenderer} />
      </div>
    </div>
  )
}
