import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { ColorHistoryEntry } from '@/ui/hooks/usePlayer'

interface ColorPopulationPlotProps {
  history: ColorHistoryEntry[]
}

const WINDOW = 50

export function ColorPopulationPlot({ history }: ColorPopulationPlotProps) {
  const visible = history.length > WINDOW ? history.slice(-WINDOW) : history

  return (
    <div className="flex h-full flex-col">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-nss-muted">
        Population by Color
      </p>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={visible} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
          <XAxis dataKey="generation" tick={{ fontSize: 9, fill: '#6b7280' }} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: '#1a1a2e', border: '1px solid #2d2d44', borderRadius: 4, fontSize: 10 }}
            labelStyle={{ color: '#a0a0b8' }}
            itemStyle={{ color: '#e0e0f0' }}
          />
          <Line type="monotone" dataKey="orange" name="Orange" stroke="#f97316" strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="blue"   name="Blue"   stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="yellow" name="Yellow" stroke="#eab308" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
