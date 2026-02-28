import { SimulationControls } from '@/ui/components/controls/SimulationControls'
import { PlayerState } from '@/simulation/core/PlayerState'

interface ControlsPanelProps {
  state?: PlayerState
  generation?: number
  generationLimit?: number
  onStart?: () => void
  onPlay?: () => void
  onPause?: () => void
  onRestart?: () => void
}

export function ControlsPanel({
  state = PlayerState.IDLE,
  generation = 0,
  generationLimit = 100,
  onStart = () => {},
  onPlay = () => {},
  onPause = () => {},
  onRestart = () => {},
}: ControlsPanelProps) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-nss-border bg-nss-surface p-3">
      <span className="mb-3 text-xs font-semibold uppercase tracking-widest text-nss-muted">
        Timeline &amp; Controls
      </span>
      <SimulationControls
        state={state}
        generation={generation}
        generationLimit={generationLimit}
        onStart={onStart}
        onPlay={onPlay}
        onPause={onPause}
        onRestart={onRestart}
      />
    </div>
  )
}
