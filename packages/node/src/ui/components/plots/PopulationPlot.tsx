import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { HistoryEntry } from '@/ui/hooks/usePlayer'

const WINDOW = 50

interface PopulationPlotProps {
  history: HistoryEntry[]
}

export function PopulationPlot({ history }: PopulationPlotProps) {
  const visible = history.length > WINDOW ? history.slice(-WINDOW) : history

  return (
    <div className="flex h-full flex-col">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-nss-muted">
        Population
      </p>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={visible} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis
            dataKey="generation"
            tick={{ fill: '#888888', fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: '#2a2a2a' }}
          />
          <YAxis
            tick={{ fill: '#888888', fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: '#2a2a2a' }}
          />
          <Tooltip
            contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 6 }}
            labelStyle={{ color: '#888888', fontSize: 10 }}
            itemStyle={{ color: '#f97316', fontSize: 11 }}
          />
          <Line
            type="monotone"
            dataKey="population"
            stroke="#f97316"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
