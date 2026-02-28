import { PlayerState } from '@/simulation/core/PlayerState'
import type { Lizard } from '@/simulation/core/Lizard'
import type { MetricSnapshot } from '@/ui/adapters/UISimulationAdapter'
import type { Level1UIAdapter } from '@/ui/adapters/Level1UIAdapter'
import type { Level2UIAdapter } from '@/ui/adapters/Level2UIAdapter'
import type { Level1SimulationParams } from '@/simulation/levels/level1/Level1SimulationParams'
import type { Level2SimulationParams } from '@/simulation/levels/level2/Level2SimulationParams'
import type { HistoryEntry, ColorHistoryEntry, SexualSelectionStats, SimLevel } from '@/ui/hooks/usePlayer'
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
  colorHistory?: ColorHistoryEntry[]
  sexualSelectionStats?: SexualSelectionStats
  level?: SimLevel
  adapter?: Level1UIAdapter | Level2UIAdapter
  level1Params?: Level1SimulationParams
  level2Params?: Level2SimulationParams
  sexualSelectionEnabled?: boolean
  onStart?: () => void
  onPlay?: () => void
  onPause?: () => void
  onRestart?: () => void
  onUpdateLevel1Params?: (partial: Partial<Level1SimulationParams>) => void
  onUpdateLevel2Params?: (partial: Partial<Level2SimulationParams>) => void
  onSetLevel?: (l: SimLevel) => void
  onSetSexualSelectionEnabled?: (enabled: boolean) => void
  onWorldResize?: (width: number, height: number) => void
}

export function AppLayout({
  playerState = PlayerState.IDLE,
  generation = 0,
  generationLimit = 100,
  lizards = [],
  metrics,
  history = [],
  colorHistory = [],
  sexualSelectionStats = { orange: 0, blue: 0, yellow: 0 },
  level = 1,
  adapter,
  level1Params,
  level2Params,
  sexualSelectionEnabled = false,
  onStart,
  onPlay,
  onPause,
  onRestart,
  onUpdateLevel1Params,
  onUpdateLevel2Params,
  onSetLevel,
  onSetSexualSelectionEnabled,
  onWorldResize,
}: AppLayoutProps) {
  return (
    <div className="flex h-screen w-screen flex-col gap-2 bg-nss-bg p-2">
      {/* Row 1 — 70%: organism display (60%) + plots (40%) */}
      <div className="flex min-h-0 flex-[7] gap-2">
        <div className="min-w-0 flex-[6]">
          <OrganismPanel lizards={lizards} onWorldResize={onWorldResize} />
        </div>
        <div className="min-w-0 flex-[4]">
          <PlotsPanel
            level={level}
            history={history}
            colorHistory={colorHistory}
            sexualSelectionStats={sexualSelectionStats}
            sexualSelectionEnabled={sexualSelectionEnabled}
            plotSeries={adapter?.getPlotSeries()}
          />
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
            level={level}
            level1Params={level1Params}
            level2Params={level2Params}
            metrics={metrics}
            sexualSelectionEnabled={sexualSelectionEnabled}
            onUpdateLevel1Params={onUpdateLevel1Params}
            onUpdateLevel2Params={onUpdateLevel2Params}
            onSetLevel={onSetLevel}
            onSetSexualSelectionEnabled={onSetSexualSelectionEnabled}
          />
        </div>
      </div>
    </div>
  )
}
