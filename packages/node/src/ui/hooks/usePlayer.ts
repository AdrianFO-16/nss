import { useCallback, useRef, useState } from 'react'
import { Player } from '@/simulation/core/Player'
import { PlayerState } from '@/simulation/core/PlayerState'
import type { Lizard } from '@/simulation/core/Lizard'
import type { MetricSnapshot } from '@/ui/adapters/UISimulationAdapter'
import { Level1Simulation } from '@/simulation/levels/level1/Level1Simulation'
import { DEFAULT_LEVEL1_PARAMS, type Level1SimulationParams } from '@/simulation/levels/level1/Level1SimulationParams'
import { Level1UIAdapter } from '@/ui/adapters/Level1UIAdapter'

export interface HistoryEntry {
  generation: number
  population: number
  averageBodySize: number
}

export interface UsePlayerReturn {
  state: PlayerState
  generation: number
  lizards: Lizard[]
  metrics: MetricSnapshot
  history: HistoryEntry[]
  adapter: Level1UIAdapter
  params: Level1SimulationParams
  start: () => void
  play: () => void
  pause: () => void
  restart: () => void
  updateParams: (partial: Partial<Level1SimulationParams>) => void
}

function makeSimulation(): Level1Simulation {
  return new Level1Simulation({ ...DEFAULT_LEVEL1_PARAMS })
}

const EMPTY_METRICS: MetricSnapshot = {
  generation: 0,
  totalPopulation: 0,
  maxPopReached: false,
  extinctionGuardActive: false,
  averageBodySize: 0,
}

export function usePlayer(): UsePlayerReturn {
  const simulationRef = useRef<Level1Simulation>(makeSimulation())
  const adapterRef = useRef<Level1UIAdapter>(new Level1UIAdapter(simulationRef.current))
  const playerRef = useRef<Player>(() => {
    const p = new Player()
    p.setSimulation(simulationRef.current)
    return p
  })

  const [state, setState] = useState<PlayerState>(PlayerState.IDLE)
  const [generation, setGeneration] = useState(0)
  const [lizards, setLizards] = useState<Lizard[]>([])
  const [metrics, setMetrics] = useState<MetricSnapshot>(EMPTY_METRICS)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [params, setParams] = useState<Level1SimulationParams>({ ...DEFAULT_LEVEL1_PARAMS })

  playerRef.current.onTick = useCallback((result) => {
    setState(result.playerState)
    setGeneration(result.generation)
    setLizards(result.lizards)
    setMetrics(result.metrics)
    setHistory(prev => [
      ...prev,
      {
        generation: result.generation,
        population: result.metrics.totalPopulation,
        averageBodySize: (result.metrics.averageBodySize as number) ?? 0,
      },
    ])
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
    setMetrics(EMPTY_METRICS)
    setHistory([])
  }, [])

  const updateParams = useCallback((partial: Partial<Level1SimulationParams>) => {
    Object.assign(simulationRef.current.params, partial)
    setParams(prev => ({ ...prev, ...partial }))

    // Restart interval if tickRateMs changed while running
    if (partial.tickRateMs !== undefined && playerRef.current.state === PlayerState.RUNNING) {
      playerRef.current.pause()
      playerRef.current.play()
    }
  }, [])

  return {
    state,
    generation,
    lizards,
    metrics,
    history,
    adapter: adapterRef.current,
    params,
    start,
    play,
    pause,
    restart,
    updateParams,
  }
}
