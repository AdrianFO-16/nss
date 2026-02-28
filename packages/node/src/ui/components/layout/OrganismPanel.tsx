import { OrganismDisplay } from '@/ui/components/display/OrganismDisplay'
import { Canvas2DRenderer } from '@/ui/components/display/Canvas2DRenderer'
import type { Lizard } from '@/simulation/core/Lizard'

interface OrganismPanelProps {
  lizards?: Lizard[]
}

export function OrganismPanel({ lizards = [] }: OrganismPanelProps) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-nss-border bg-nss-surface p-3">
      <span className="mb-2 text-xs font-semibold uppercase tracking-widest text-nss-muted">
        Organism Display
      </span>
      <div className="relative min-h-0 flex-1 overflow-hidden rounded bg-nss-bg">
        <OrganismDisplay
          lizards={lizards}
          renderer={Canvas2DRenderer}
        />
      </div>
    </div>
  )
}
