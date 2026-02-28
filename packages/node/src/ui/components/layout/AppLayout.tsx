import { PlayerState } from '@/simulation/core/PlayerState'
import type { Lizard } from '@/simulation/core/Lizard'
import { OrganismPanel } from './OrganismPanel'
import { PlotsPanel } from './PlotsPanel'
import { ControlsPanel } from './ControlsPanel'
import { ParamsPanel } from './ParamsPanel'

interface AppLayoutProps {
  playerState?: PlayerState
  generation?: number
  generationLimit?: number
  lizards?: Lizard[]
  onStart?: () => void
  onPlay?: () => void
  onPause?: () => void
  onRestart?: () => void
}

export function AppLayout({
  playerState = PlayerState.IDLE,
  generation = 0,
  generationLimit = 100,
  lizards = [],
  onStart,
  onPlay,
  onPause,
  onRestart,
}: AppLayoutProps) {
  return (
    <div className="flex h-screen w-screen flex-col gap-2 bg-nss-bg p-2">
      {/* Row 1 — 70% height: organism display (60%) + plots (40%) */}
      <div className="flex min-h-0 flex-[7] gap-2">
        <div className="min-w-0 flex-[6]">
          <OrganismPanel lizards={lizards} />
        </div>
        <div className="min-w-0 flex-[4]">
          <PlotsPanel />
        </div>
      </div>

      {/* Row 2 — 30% height: controls (50%) + params (50%) */}
      <div className="flex min-h-0 flex-[3] gap-2">
        <div className="min-w-0 flex-1">
          <ControlsPanel
            state={playerState}
            generation={generation}
            generationLimit={generationLimit}
            onStart={onStart}
            onPlay={onPlay}
            onPause={onPause}
            onRestart={onRestart}
          />
        </div>
        <div className="min-w-0 flex-1">
          <ParamsPanel />
        </div>
      </div>
    </div>
  )
}
