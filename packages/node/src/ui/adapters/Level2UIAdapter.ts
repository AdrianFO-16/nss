import type { UISimulationAdapter, ParamDefinition, PlotSeries, MetricSnapshot } from './UISimulationAdapter'
import type { Level2Simulation } from '@/simulation/levels/level2/Level2Simulation'
import type { SexualSelectionAddon } from '@/simulation/addons/SexualSelectionAddon'

/**
 * Concrete adapter for Level 2 (P-A5).
 * Optionally holds a reference to the SexualSelectionAddon to include its
 * enabledSuccesses in the MetricSnapshot.
 */
export class Level2UIAdapter implements UISimulationAdapter<Level2Simulation> {
  simulation: Level2Simulation
  addon: SexualSelectionAddon | null = null

  constructor(simulation: Level2Simulation) {
    this.simulation = simulation
  }

  getParamDefinitions(): ParamDefinition[] {
    return [
      { key: 'initialPopulation', label: 'Initial Population', type: 'slider', min: 30, max: 600, step: 30, lockedAfterStart: true },
      { key: 'generationLimit', label: 'Generation Limit', type: 'slider', min: 10, max: 500, step: 10 },
      { key: 'tickRateMs', label: 'Tick Rate (ms)', type: 'slider', min: 100, max: 2000, step: 100 },
      { key: 'deathDistribution.type', label: 'Death Distribution', type: 'select', options: [{ value: 'normal', label: 'Normal' }, { value: 'exponential', label: 'Exponential' }] },
      { key: 'deathThreshold', label: 'Death Threshold', type: 'slider', min: 0, max: 1, step: 0.05 },
      { key: 'orangeBaseReproProb', label: 'Orange Base Repro Prob', type: 'slider', min: 0, max: 1, step: 0.05 },
      { key: 'blueBaseReproProb', label: 'Blue Base Repro Prob', type: 'slider', min: 0, max: 1, step: 0.05 },
      { key: 'yellowBaseReproProb', label: 'Yellow Base Repro Prob', type: 'slider', min: 0, max: 1, step: 0.05 },
      { key: 'yellowBonusPerOrangeNeighbor', label: 'Yellow Bonus / Orange Neighbor', type: 'slider', min: 0, max: 0.5, step: 0.01 },
      { key: 'neighborhoodRadius', label: 'Neighborhood Radius', type: 'slider', min: 5, max: 200, step: 5 },
      { key: 'discreteMode', label: 'Discrete Mode', type: 'toggle' },
      { key: 'mutationStddev', label: 'Mutation Std Dev', type: 'slider', min: 0.01, max: 0.5, step: 0.01 },
    ]
  }

  getPlotSeries(): PlotSeries[] {
    const series: PlotSeries[] = [
      { key: 'orange', label: 'Orange', color: '#f97316', chartType: 'line' },
      { key: 'blue',   label: 'Blue',   color: '#3b82f6', chartType: 'line' },
      { key: 'yellow', label: 'Yellow', color: '#eab308', chartType: 'line' },
    ]
    if (this.addon) {
      series.push(
        { key: 'enabledSuccesses.orange', label: 'Bonus Repro (Orange)', color: '#f97316', chartType: 'bar' },
        { key: 'enabledSuccesses.blue',   label: 'Bonus Repro (Blue)',   color: '#3b82f6', chartType: 'bar' },
        { key: 'enabledSuccesses.yellow', label: 'Bonus Repro (Yellow)', color: '#eab308', chartType: 'bar' },
      )
    }
    return series
  }

  getMetrics(): MetricSnapshot {
    const base = this.simulation.getMetrics()
    return {
      ...base,
      enabledSuccesses: this.addon?.enabledSuccesses ?? { orange: 0, blue: 0, yellow: 0 },
    }
  }
}
