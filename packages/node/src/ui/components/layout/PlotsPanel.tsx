import type { HistoryEntry, ColorHistoryEntry, SexualSelectionStats, SimLevel } from '@/ui/hooks/usePlayer'
import type { PlotSeries } from '@/ui/adapters/UISimulationAdapter'
import { PopulationPlot } from '@/ui/components/plots/PopulationPlot'
import { BodySizePlot } from '@/ui/components/plots/BodySizePlot'
import { ColorPopulationPlot } from '@/ui/components/plots/ColorPopulationPlot'
import { SexualSelectionBarChart } from '@/ui/components/plots/SexualSelectionBarChart'

interface PlotsPanelProps {
  level?: SimLevel
  history?: HistoryEntry[]
  colorHistory?: ColorHistoryEntry[]
  sexualSelectionStats?: SexualSelectionStats
  sexualSelectionEnabled?: boolean
  plotSeries?: PlotSeries[]
}

export function PlotsPanel({
  level = 1,
  history = [],
  colorHistory = [],
  sexualSelectionStats = { orange: 0, blue: 0, yellow: 0 },
  sexualSelectionEnabled = false,
  plotSeries: _plotSeries,
}: PlotsPanelProps) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-nss-border bg-nss-surface p-3">
      <span className="mb-2 text-xs font-semibold uppercase tracking-widest text-nss-muted">
        Plots
      </span>

      {level === 1 ? (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="min-h-0 flex-1">
            <PopulationPlot history={history} />
          </div>
          <div className="min-h-0 flex-1">
            <BodySizePlot history={history} />
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className={`min-h-0 ${sexualSelectionEnabled ? 'flex-1' : 'flex-[2]'}`}>
            <ColorPopulationPlot history={colorHistory} />
          </div>
          {sexualSelectionEnabled && (
            <div className="min-h-0 flex-1">
              <SexualSelectionBarChart stats={sexualSelectionStats} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
