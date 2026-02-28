import { PlayerState } from '@/simulation/core/PlayerState'
import type { Level1SimulationParams } from '@/simulation/levels/level1/Level1SimulationParams'
import type { MetricSnapshot } from '@/ui/adapters/UISimulationAdapter'
import { Level1ParamsPanel } from '@/ui/components/params/Level1ParamsPanel'

interface ParamsPanelProps {
  playerState?: PlayerState
  params?: Level1SimulationParams
  metrics?: MetricSnapshot
  onUpdateParams?: (partial: Partial<Level1SimulationParams>) => void
}

export function ParamsPanel({
  playerState = PlayerState.IDLE,
  params,
  metrics,
  onUpdateParams,
}: ParamsPanelProps) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-nss-border bg-nss-surface p-3">
      <span className="mb-3 text-xs font-semibold uppercase tracking-widest text-nss-muted">
        Parameters
      </span>
      {params && onUpdateParams ? (
        <Level1ParamsPanel
          params={params}
          playerState={playerState}
          metrics={metrics}
          onUpdateParams={onUpdateParams}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center rounded bg-nss-bg">
          <span className="text-sm text-nss-muted">Loading params…</span>
        </div>
      )}
    </div>
  )
}
