import type { SimulationLevel } from '@/simulation/core/SimulationLevel'

/** Describes a single user-editable simulation parameter for the UI param panel. */
export interface ParamDefinition {
  key: string
  label: string
  type: 'slider' | 'select' | 'toggle' | 'number'
  min?: number
  max?: number
  step?: number
  options?: { value: string; label: string }[]
  lockedAfterStart?: boolean
}

/** Describes a single data series to render in the plots panel. */
export interface PlotSeries {
  key: string
  label: string
  color: string
  chartType: 'line' | 'bar'
}

/** Snapshot of simulation metrics emitted each tick. */
export interface MetricSnapshot {
  generation: number
  totalPopulation: number
  maxPopReached: boolean
  extinctionGuardActive: boolean
  [key: string]: unknown
}

/**
 * Generic UI contract per simulation level (P-A5).
 * Each concrete level registers its own adapter that implements this interface.
 * The UI renders generically from the adapter outputs, never importing
 * simulation internals directly.
 */
export interface UISimulationAdapter<T extends SimulationLevel> {
  simulation: T
  getParamDefinitions(): ParamDefinition[]
  getPlotSeries(): PlotSeries[]
  getMetrics(): MetricSnapshot
}
