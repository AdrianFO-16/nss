import { Play, Pause, RotateCcw, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlayerState } from '@/simulation/core/PlayerState'

interface SimulationControlsProps {
  state: PlayerState
  generation: number
  generationLimit: number
  onStart: () => void
  onPlay: () => void
  onPause: () => void
  onRestart: () => void
}

export function SimulationControls({
  state,
  generation,
  generationLimit,
  onStart,
  onPlay,
  onPause,
  onRestart,
}: SimulationControlsProps) {
  const isIdle = state === PlayerState.IDLE
  const isRunning = state === PlayerState.RUNNING
  const isPaused = state === PlayerState.PAUSED
  const isEnded = state === PlayerState.ENDED
  const hasStarted = !isIdle

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Generation counter */}
      <div className="flex items-baseline gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-nss-muted">
          Generation
        </span>
        <span className="font-mono text-lg font-bold text-nss-text">
          {generation}
        </span>
        <span className="text-nss-muted">/</span>
        <span className="font-mono text-sm text-nss-muted">{generationLimit}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-nss-border">
        <div
          className="h-full rounded-full bg-nss-orange transition-all duration-300"
          style={{ width: generationLimit > 0 ? `${Math.min(100, (generation / generationLimit) * 100)}%` : '0%' }}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Start — only visible in IDLE state */}
        {isIdle && (
          <Button
            onClick={onStart}
            className="gap-2 bg-nss-orange text-nss-bg hover:bg-nss-orange/90"
            size="sm"
          >
            <Zap className="size-4" />
            Start
          </Button>
        )}

        {/* Play / Pause toggle */}
        {(isRunning || isPaused) && (
          <Button
            onClick={isRunning ? onPause : onPlay}
            variant="outline"
            size="sm"
            className="gap-2 border-nss-border text-nss-text hover:bg-nss-surface-raised"
          >
            {isRunning ? (
              <>
                <Pause className="size-4" /> Pause
              </>
            ) : (
              <>
                <Play className="size-4" /> Play
              </>
            )}
          </Button>
        )}

        {/* Ended state hint */}
        {isEnded && (
          <span className="text-sm text-nss-muted">Simulation ended</span>
        )}

        {/* Restart — available after start */}
        {hasStarted && (
          <Button
            onClick={onRestart}
            variant="ghost"
            size="sm"
            className="gap-2 text-nss-muted hover:bg-nss-surface-raised hover:text-nss-text"
          >
            <RotateCcw className="size-4" />
            Restart
          </Button>
        )}
      </div>

      {/* State badge */}
      <div className="mt-auto">
        <span
          className={`inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${
            isRunning
              ? 'bg-nss-orange/20 text-nss-orange'
              : isPaused
                ? 'bg-nss-yellow/20 text-nss-yellow'
                : isEnded
                  ? 'bg-nss-blue/20 text-nss-blue'
                  : 'bg-nss-surface-raised text-nss-muted'
          }`}
        >
          {state}
        </span>
      </div>
    </div>
  )
}
