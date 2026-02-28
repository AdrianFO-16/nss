import type { HistoryEntry } from '@/ui/hooks/usePlayer'
import type { PlotSeries } from '@/ui/adapters/UISimulationAdapter'
import { PopulationPlot } from '@/ui/components/plots/PopulationPlot'
import { BodySizePlot } from '@/ui/components/plots/BodySizePlot'

interface PlotsPanelProps {
  history?: HistoryEntry[]
  plotSeries?: PlotSeries[]
}

export function PlotsPanel({ history = [], plotSeries: _plotSeries }: PlotsPanelProps) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-nss-border bg-nss-surface p-3">
      <span className="mb-2 text-xs font-semibold uppercase tracking-widest text-nss-muted">
        Plots
      </span>
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="min-h-0 flex-1">
          <PopulationPlot history={history} />
        </div>
        <div className="min-h-0 flex-1">
          <BodySizePlot history={history} />
        </div>
      </div>
    </div>
  )
}
