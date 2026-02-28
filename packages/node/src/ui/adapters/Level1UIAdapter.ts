import type { UISimulationAdapter, ParamDefinition, PlotSeries, MetricSnapshot } from './UISimulationAdapter'
import type { Level1Simulation } from '@/simulation/levels/level1/Level1Simulation'

/**
 * Concrete adapter for Level 1 (P-A5).
 * The UI consumes this interface — it never imports Level1Simulation directly.
 */
export class Level1UIAdapter implements UISimulationAdapter<Level1Simulation> {
  simulation: Level1Simulation

  constructor(simulation: Level1Simulation) {
    this.simulation = simulation
  }

  getParamDefinitions(): ParamDefinition[] {
    return [
      // Locked-after-start global
      {
        key: 'initialPopulation',
        label: 'Initial Population',
        type: 'slider',
        min: 10,
        max: 500,
        step: 10,
        lockedAfterStart: true,
      },
      // General
      { key: 'generationLimit', label: 'Generation Limit', type: 'number', min: 1 },
      { key: 'tickRateMs', label: 'Tick Rate (ms)', type: 'slider', min: 100, max: 2000, step: 100 },
      // Body size distribution
      { key: 'bodySizeDistribution.type', label: 'Body Size Distribution', type: 'select', options: [{ value: 'normal', label: 'Normal' }, { value: 'exponential', label: 'Exponential' }] },
      { key: 'bodySizeDistribution.params.mean', label: 'Body Size Mean', type: 'slider', min: 0.5, max: 20, step: 0.5 },
      { key: 'bodySizeDistribution.params.stddev', label: 'Body Size Std Dev', type: 'slider', min: 0.1, max: 5, step: 0.1 },
      { key: 'bodySizeDistribution.params.lambda', label: 'Body Size Lambda', type: 'slider', min: 0.1, max: 5, step: 0.1 },
      // Death
      { key: 'deathDistribution.type', label: 'Death Distribution', type: 'select', options: [{ value: 'normal', label: 'Normal' }, { value: 'exponential', label: 'Exponential' }] },
      { key: 'deathDistribution.params.mean', label: 'Death Mean', type: 'slider', min: 0, max: 1, step: 0.05 },
      { key: 'deathDistribution.params.stddev', label: 'Death Std Dev', type: 'slider', min: 0.01, max: 0.5, step: 0.01 },
      { key: 'deathThreshold', label: 'Death Threshold', type: 'slider', min: 0, max: 1, step: 0.05 },
      // Reproduction
      { key: 'reproductionDistribution.type', label: 'Reproduction Distribution', type: 'select', options: [{ value: 'normal', label: 'Normal' }, { value: 'exponential', label: 'Exponential' }] },
      { key: 'reproductionDistribution.params.mean', label: 'Reproduction Mean', type: 'slider', min: 0, max: 1, step: 0.05 },
      { key: 'reproductionDistribution.params.stddev', label: 'Reproduction Std Dev', type: 'slider', min: 0.01, max: 0.5, step: 0.01 },
      { key: 'mutationStddev', label: 'Mutation Std Dev', type: 'slider', min: 0.01, max: 1, step: 0.01 },
    ]
  }

  getPlotSeries(): PlotSeries[] {
    return [
      { key: 'population', label: 'Population', color: '#f97316', chartType: 'line' },
      { key: 'averageBodySize', label: 'Avg Body Size', color: '#f5f5f5', chartType: 'line' },
    ]
  }

  getMetrics(): MetricSnapshot {
    return this.simulation.getMetrics()
  }
}
