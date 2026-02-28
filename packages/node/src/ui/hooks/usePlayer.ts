import { useCallback, useRef, useState } from 'react'
import { Player } from '@/simulation/core/Player'
import { PlayerState } from '@/simulation/core/PlayerState'
import type { Lizard } from '@/simulation/core/Lizard'
import type { MetricSnapshot } from '@/ui/adapters/UISimulationAdapter'
import { Level1Simulation } from '@/simulation/levels/level1/Level1Simulation'
import { DEFAULT_LEVEL1_PARAMS, type Level1SimulationParams } from '@/simulation/levels/level1/Level1SimulationParams'
import { Level1UIAdapter } from '@/ui/adapters/Level1UIAdapter'
import { Level2Simulation } from '@/simulation/levels/level2/Level2Simulation'
import { DEFAULT_LEVEL2_PARAMS, type Level2SimulationParams } from '@/simulation/levels/level2/Level2SimulationParams'
import { Level2UIAdapter } from '@/ui/adapters/Level2UIAdapter'
import { SexualSelectionAddon } from '@/simulation/addons/SexualSelectionAddon'

export interface HistoryEntry {
  generation: number
  population: number
  averageBodySize: number
}

export interface ColorHistoryEntry {
  generation: number
  orange: number
  blue: number
  yellow: number
}

export interface SexualSelectionStats {
  orange: number
  blue: number
  yellow: number
}

export type SimLevel = 1 | 2

export interface UsePlayerReturn {
  state: PlayerState
  generation: number
  lizards: Lizard[]
  metrics: MetricSnapshot
  history: HistoryEntry[]
  colorHistory: ColorHistoryEntry[]
  sexualSelectionStats: SexualSelectionStats
  level: SimLevel
  adapter: Level1UIAdapter | Level2UIAdapter
  level1Params: Level1SimulationParams
  level2Params: Level2SimulationParams
  sexualSelectionEnabled: boolean
  setLevel: (l: SimLevel) => void
  setSexualSelectionEnabled: (enabled: boolean) => void
  start: () => void
  play: () => void
  pause: () => void
  restart: () => void
  updateLevel1Params: (partial: Partial<Level1SimulationParams>) => void
  updateLevel2Params: (partial: Partial<Level2SimulationParams>) => void
  setWorldSize: (width: number, height: number) => void
}

const EMPTY_METRICS: MetricSnapshot = {
  generation: 0,
  totalPopulation: 0,
  maxPopReached: false,
  extinctionGuardActive: false,
}

const EMPTY_SSA_STATS: SexualSelectionStats = { orange: 0, blue: 0, yellow: 0 }

export function usePlayer(): UsePlayerReturn {
  // ── Simulation instances (one of each, swapped on level change) ──
  const sim1Ref = useRef<Level1Simulation>(new Level1Simulation({ ...DEFAULT_LEVEL1_PARAMS }))
  const sim2Ref = useRef<Level2Simulation>(new Level2Simulation({ ...DEFAULT_LEVEL2_PARAMS }))
  const adapter1Ref = useRef<Level1UIAdapter>(new Level1UIAdapter(sim1Ref.current))
  const adapter2Ref = useRef<Level2UIAdapter>(new Level2UIAdapter(sim2Ref.current))
  const ssaRef = useRef<SexualSelectionAddon>(new SexualSelectionAddon())
  const playerRef = useRef<Player>(new Player())

  // Wire player to level 1 by default
  playerRef.current.setSimulation(sim1Ref.current)

  // ── React state ──
  const [state, setState] = useState<PlayerState>(PlayerState.IDLE)
  const [generation, setGeneration] = useState(0)
  const [lizards, setLizards] = useState<Lizard[]>([])
  const [metrics, setMetrics] = useState<MetricSnapshot>(EMPTY_METRICS)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [colorHistory, setColorHistory] = useState<ColorHistoryEntry[]>([])
  const [sexualSelectionStats, setSexualSelectionStats] = useState<SexualSelectionStats>(EMPTY_SSA_STATS)
  const [level, setLevelState] = useState<SimLevel>(1)
  const [sexualSelectionEnabled, setSexualSelectionEnabledState] = useState(false)
  const [level1Params, setLevel1Params] = useState<Level1SimulationParams>({ ...DEFAULT_LEVEL1_PARAMS })
  const [level2Params, setLevel2Params] = useState<Level2SimulationParams>({ ...DEFAULT_LEVEL2_PARAMS })

  const resetPlayState = useCallback(() => {
    setState(PlayerState.IDLE)
    setGeneration(0)
    setLizards([])
    setMetrics(EMPTY_METRICS)
    setHistory([])
    setColorHistory([])
    setSexualSelectionStats(EMPTY_SSA_STATS)
  }, [])

  // ── onTick wired to current player ──
  playerRef.current.onTick = useCallback((result) => {
    setState(result.playerState)
    setGeneration(result.generation)
    setLizards(result.lizards)
    setMetrics(result.metrics)

    const pop = result.metrics.totalPopulation
    const colorPop = result.metrics.populationByColor as { orange: number; blue: number; yellow: number } | undefined

    setHistory(prev => [...prev, {
      generation: result.generation,
      population: pop,
      averageBodySize: (result.metrics.averageBodySize as number) ?? 0,
    }])

    if (colorPop) {
      setColorHistory(prev => [...prev, {
        generation: result.generation,
        orange: colorPop.orange,
        blue:   colorPop.blue,
        yellow: colorPop.yellow,
      }])
    }

    const es = result.metrics.enabledSuccesses as SexualSelectionStats | undefined
    if (es) setSexualSelectionStats({ ...es })
  }, [])

  // ── Level switching ──
  const setLevel = useCallback((l: SimLevel) => {
    playerRef.current.restart()
    resetPlayState()
    setLevelState(l)

    if (l === 1) {
      playerRef.current.setSimulation(sim1Ref.current)
      playerRef.current.addons = []
    } else {
      playerRef.current.setSimulation(sim2Ref.current)
      ssaRef.current.reset()
    }
  }, [resetPlayState])

  // ── Sexual selection (Level 3) ──
  const setSexualSelectionEnabled = useCallback((enabled: boolean) => {
    setSexualSelectionEnabledState(enabled)
    ssaRef.current.reset()

    if (enabled) {
      adapter2Ref.current.addon = ssaRef.current
      playerRef.current.addons = [ssaRef.current]
    } else {
      adapter2Ref.current.addon = null
      playerRef.current.addons = []
    }
  }, [])

  // ── Controls ──
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
    ssaRef.current.reset()
    resetPlayState()
  }, [resetPlayState])

  // ── Param updates ──
  const updateLevel1Params = useCallback((partial: Partial<Level1SimulationParams>) => {
    Object.assign(sim1Ref.current.params, partial)
    setLevel1Params(prev => ({ ...prev, ...partial }))
    if (partial.tickRateMs !== undefined && playerRef.current.state === PlayerState.RUNNING) {
      playerRef.current.pause()
      playerRef.current.play()
    }
  }, [])

  const updateLevel2Params = useCallback((partial: Partial<Level2SimulationParams>) => {
    Object.assign(sim2Ref.current.params, partial)
    setLevel2Params(prev => ({ ...prev, ...partial }))
    if (partial.tickRateMs !== undefined && playerRef.current.state === PlayerState.RUNNING) {
      playerRef.current.pause()
      playerRef.current.play()
    }
  }, [])

  const setWorldSize = useCallback((width: number, height: number) => {
    updateLevel1Params({ worldWidth: width, worldHeight: height })
    updateLevel2Params({ worldWidth: width, worldHeight: height })
  }, [updateLevel1Params, updateLevel2Params])

  const adapter: Level1UIAdapter | Level2UIAdapter =
    level === 1 ? adapter1Ref.current : adapter2Ref.current

  return {
    state,
    generation,
    lizards,
    metrics,
    history,
    colorHistory,
    sexualSelectionStats,
    level,
    adapter,
    level1Params,
    level2Params,
    sexualSelectionEnabled,
    setLevel,
    setSexualSelectionEnabled,
    start,
    play,
    pause,
    restart,
    updateLevel1Params,
    updateLevel2Params,
    setWorldSize,
  }
}
