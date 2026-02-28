import { usePlayer } from '@/ui/hooks/usePlayer'
import { AppLayout } from '@/ui/components/layout/AppLayout'

export default function App() {
  const { state, generation, lizards, start, play, pause, restart } = usePlayer()

  return (
    <AppLayout
      playerState={state}
      generation={generation}
      lizards={lizards}
      onStart={start}
      onPlay={play}
      onPause={pause}
      onRestart={restart}
    />
  )
}
