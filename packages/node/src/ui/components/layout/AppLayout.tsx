import { Group, Panel, Separator } from 'react-resizable-panels'
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
  bodySizeSnapshot?: number[]
  currentBodySizes?: number[]
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

/**
 * Vertical drag handle — sits between horizontally adjacent panels.
 * Renders as a narrow slot; the inner pip highlights on hover / drag.
 */
function HResizeHandle() {
  return (
    <Separator className="group flex w-2 shrink-0 cursor-col-resize items-center justify-center outline-none">
      <div className="h-10 w-px rounded-full bg-nss-border transition-colors group-hover:bg-nss-orange group-data-[separator=active]:bg-nss-orange" />
    </Separator>
  )
}

/**
 * Horizontal drag handle — sits between vertically adjacent panels.
 */
function VResizeHandle() {
  return (
    <Separator className="group flex h-2 shrink-0 cursor-row-resize items-center justify-center outline-none">
      <div className="h-px w-10 rounded-full bg-nss-border transition-colors group-hover:bg-nss-orange group-data-[separator=active]:bg-nss-orange" />
    </Separator>
  )
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
  bodySizeSnapshot = [],
  currentBodySizes = [],
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
    <div className="h-screen w-screen bg-nss-bg p-2">
      {/* Outer vertical split: top row (organisms + plots) / bottom row (controls + params) */}
      <Group orientation="vertical" className="h-full">
        <Panel defaultSize={70} minSize={25}>
          {/* Inner horizontal split: organism canvas / plots */}
          <Group orientation="horizontal" className="h-full">
            <Panel defaultSize={60} minSize={20}>
              <OrganismPanel lizards={lizards} onWorldResize={onWorldResize} />
            </Panel>
            <HResizeHandle />
            <Panel defaultSize={40} minSize={15}>
              <PlotsPanel
                level={level}
                history={history}
                colorHistory={colorHistory}
                sexualSelectionStats={sexualSelectionStats}
                sexualSelectionEnabled={sexualSelectionEnabled}
                bodySizeSnapshot={bodySizeSnapshot}
                currentBodySizes={currentBodySizes}
                plotSeries={adapter?.getPlotSeries()}
              />
            </Panel>
          </Group>
        </Panel>

        <VResizeHandle />

        <Panel defaultSize={30} minSize={15}>
          {/* Inner horizontal split: controls / params */}
          <Group orientation="horizontal" className="h-full">
            <Panel defaultSize={50} minSize={20}>
              <ControlsPanel
                state={playerState}
                generation={generation}
                generationLimit={generationLimit}
                onStart={onStart}
                onPlay={onPlay}
                onPause={onPause}
                onRestart={onRestart}
              />
            </Panel>
            <HResizeHandle />
            <Panel defaultSize={50} minSize={20}>
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
            </Panel>
          </Group>
        </Panel>
      </Group>
    </div>
  )
}
