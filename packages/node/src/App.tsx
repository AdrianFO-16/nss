import { usePlayer } from '@/ui/hooks/usePlayer'
import { AppLayout } from '@/ui/components/layout/AppLayout'

export default function App() {
  const {
    state,
    generation,
    lizards,
    metrics,
    history,
    adapter,
    params,
    start,
    play,
    pause,
    restart,
    updateParams,
  } = usePlayer()

  return (
    <AppLayout
      playerState={state}
      generation={generation}
      generationLimit={params.generationLimit}
      lizards={lizards}
      metrics={metrics}
      history={history}
      adapter={adapter}
      params={params}
      onStart={start}
      onPlay={play}
      onPause={pause}
      onRestart={restart}
      onUpdateParams={updateParams}
    />
  )
}
