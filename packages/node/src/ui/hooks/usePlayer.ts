import { useCallback, useRef, useState } from 'react'
import { Player } from '@/simulation/core/Player'
import { PlayerState } from '@/simulation/core/PlayerState'
import type { Lizard } from '@/simulation/core/Lizard'

export interface UsePlayerReturn {
  state: PlayerState
  generation: number
  lizards: Lizard[]
  start: () => void
  play: () => void
  pause: () => void
  restart: () => void
}

/**
 * React hook wrapping the Player state machine.
 * Exposes reactive state and control callbacks. Simulation loop wired in Phase 2.
 */
export function usePlayer(): UsePlayerReturn {
  const playerRef = useRef<Player>(new Player())

  const [state, setState] = useState<PlayerState>(PlayerState.IDLE)
  const [generation, setGeneration] = useState(0)
  const [lizards, setLizards] = useState<Lizard[]>([])

  // Wire Player.onTick to update React state — populated in Phase 2
  playerRef.current.onTick = useCallback((result) => {
    setState(result.playerState)
    setGeneration(result.generation)
    setLizards(result.lizards)
  }, [])

  const start = useCallback(() => {
    playerRef.current.play()
    setState(playerRef.current.state)
  }, [])

  const play = useCallback(() => {
    playerRef.current.play()
    setState(playerRef.current.state)
  }, [])

  const pause = useCallback(() => {
    playerRef.current.pause()
    setState(playerRef.current.state)
  }, [])

  const restart = useCallback(() => {
    playerRef.current.restart()
    setState(PlayerState.IDLE)
    setGeneration(0)
    setLizards([])
  }, [])

  return { state, generation, lizards, start, play, pause, restart }
}
