import { PlayerState } from '@/simulation/core/PlayerState'
import type { Level1SimulationParams } from '@/simulation/levels/level1/Level1SimulationParams'
import type { Level2SimulationParams } from '@/simulation/levels/level2/Level2SimulationParams'
import type { MetricSnapshot } from '@/ui/adapters/UISimulationAdapter'
import type { SimLevel } from '@/ui/hooks/usePlayer'
import { Level1ParamsPanel } from '@/ui/components/params/Level1ParamsPanel'
import { Level2ParamsPanel } from '@/ui/components/params/Level2ParamsPanel'
import { PresetSection } from '@/ui/components/params/PresetSection'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface ParamsPanelProps {
  playerState?: PlayerState
  level?: SimLevel
  level1Params?: Level1SimulationParams
  level2Params?: Level2SimulationParams
  metrics?: MetricSnapshot
  sexualSelectionEnabled?: boolean
  onUpdateLevel1Params?: (partial: Partial<Level1SimulationParams>) => void
  onUpdateLevel2Params?: (partial: Partial<Level2SimulationParams>) => void
  onSetLevel?: (l: SimLevel) => void
  onSetSexualSelectionEnabled?: (enabled: boolean) => void
}

export function ParamsPanel({
  playerState = PlayerState.IDLE,
  level = 1,
  level1Params,
  level2Params,
  metrics,
  sexualSelectionEnabled = false,
  onUpdateLevel1Params,
  onUpdateLevel2Params,
  onSetLevel,
  onSetSexualSelectionEnabled,
}: ParamsPanelProps) {
  const currentSeed = level === 1 ? (level1Params?.seed ?? 0) : (level2Params?.seed ?? 0)

  const presetSection = onSetLevel && onUpdateLevel1Params && onUpdateLevel2Params ? (
    <PresetSection
      level={level}
      currentSeed={currentSeed}
      onSetLevel={onSetLevel}
      onUpdateLevel1Params={onUpdateLevel1Params}
      onUpdateLevel2Params={onUpdateLevel2Params}
    />
  ) : null

  return (
    <div className="flex h-full flex-col rounded-lg border border-nss-border bg-nss-surface p-3">
      <span className="mb-3 text-xs font-semibold uppercase tracking-widest text-nss-muted">
        Parameters
      </span>

      {level === 1 && level1Params && onUpdateLevel1Params ? (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {/* Level selector — fixed height */}
          <div className="shrink-0 flex flex-col gap-1">
            <Label className="text-[10px] font-semibold uppercase tracking-widest text-nss-muted">
              Simulation Level
            </Label>
            <Select value="1" onValueChange={(v) => onSetLevel?.(Number(v) as SimLevel)}>
              <SelectTrigger className="h-7 border-nss-border bg-nss-bg text-xs text-nss-text">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-nss-border bg-nss-surface text-nss-text">
                <SelectItem value="1" className="text-xs">Level 1: Directional Selection</SelectItem>
                <SelectItem value="2" className="text-xs">Level 2: RPS Selection</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preset section — fixed height */}
          <div className="shrink-0">{presetSection}</div>

          {/* Level1ParamsPanel — takes remaining space, owns its scroll */}
          <div className="flex min-h-0 flex-1 flex-col">
            <Level1ParamsPanel
              params={level1Params}
              playerState={playerState}
              metrics={metrics}
              onUpdateParams={onUpdateLevel1Params}
            />
          </div>
        </div>
      ) : level === 2 && level2Params && onUpdateLevel2Params && onSetLevel && onSetSexualSelectionEnabled ? (
        <div className="flex min-h-0 flex-1 flex-col">
        <Level2ParamsPanel
          params={level2Params}
          playerState={playerState}
          metrics={metrics}
          sexualSelectionEnabled={sexualSelectionEnabled}
          onUpdateParams={onUpdateLevel2Params}
          onSetLevel={onSetLevel}
          onSetSexualSelectionEnabled={onSetSexualSelectionEnabled}
          presetSection={presetSection}
        />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded bg-nss-bg">
          <span className="text-sm text-nss-muted">Loading params…</span>
        </div>
      )}
    </div>
  )
}
