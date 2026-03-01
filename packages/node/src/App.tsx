import { usePlayer } from '@/ui/hooks/usePlayer'
import { AppLayout } from '@/ui/components/layout/AppLayout'

export default function App() {
  const player = usePlayer()

  return (
    <AppLayout
      playerState={player.state}
      generation={player.generation}
      generationLimit={
        player.level === 1
          ? player.level1Params.generationLimit
          : player.level2Params.generationLimit
      }
      lizards={player.lizards}
      metrics={player.metrics}
      history={player.history}
      colorHistory={player.colorHistory}
      sexualSelectionStats={player.sexualSelectionStats}
      bodySizeSnapshot={player.bodySizeSnapshot}
      currentBodySizes={player.currentBodySizes}
      level={player.level}
      adapter={player.adapter}
      level1Params={player.level1Params}
      level2Params={player.level2Params}
      sexualSelectionEnabled={player.sexualSelectionEnabled}
      onStart={player.start}
      onPlay={player.play}
      onPause={player.pause}
      onRestart={player.restart}
      onUpdateLevel1Params={player.updateLevel1Params}
      onUpdateLevel2Params={player.updateLevel2Params}
      onSetLevel={player.setLevel}
      onSetSexualSelectionEnabled={player.setSexualSelectionEnabled}
      onWorldResize={player.setWorldSize}
    />
  )
}
