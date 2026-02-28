import { PlayerState } from '@/simulation/core/PlayerState'
import type { Lizard } from '@/simulation/core/Lizard'
import type { MetricSnapshot } from '@/ui/adapters/UISimulationAdapter'
import type { Level1UIAdapter } from '@/ui/adapters/Level1UIAdapter'
import type { Level1SimulationParams } from '@/simulation/levels/level1/Level1SimulationParams'
import type { HistoryEntry } from '@/ui/hooks/usePlayer'
import { OrganismPanel } from './OrganismPanel'
import { PlotsPanel } from './PlotsPanel'
import { ControlsPanel } from './ControlsPanel'
import { ParamsPanel } from './ParamsPanel'

interface AppLayoutProps {
  playerState?: PlayerState
  generation?: number
  generationLimit?: number
  lizards?: Lizard[]
  metrics?: MetricSnapshot
  history?: HistoryEntry[]
  adapter?: Level1UIAdapter
  params?: Level1SimulationParams
  onStart?: () => void
  onPlay?: () => void
  onPause?: () => void
  onRestart?: () => void
  onUpdateParams?: (partial: Partial<Level1SimulationParams>) => void
}

export function AppLayout({
  playerState = PlayerState.IDLE,
  generation = 0,
  generationLimit = 100,
  lizards = [],
  metrics,
  history = [],
  adapter,
  params,
  onStart,
  onPlay,
  onPause,
  onRestart,
  onUpdateParams,
}: AppLayoutProps) {
  return (
    <div className="flex h-screen w-screen flex-col gap-2 bg-nss-bg p-2">
      {/* Row 1 — 70%: organism display (60%) + plots (40%) */}
      <div className="flex min-h-0 flex-[7] gap-2">
        <div className="min-w-0 flex-[6]">
          <OrganismPanel lizards={lizards} />
        </div>
        <div className="min-w-0 flex-[4]">
          <PlotsPanel history={history} plotSeries={adapter?.getPlotSeries()} />
        </div>
      </div>

      {/* Row 2 — 30%: controls (50%) + params (50%) */}
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
          <ParamsPanel
            playerState={playerState}
            params={params}
            metrics={metrics}
            onUpdateParams={onUpdateParams}
          />
        </div>
      </div>
    </div>
  )
}
