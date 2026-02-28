import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { SexualSelectionStats } from '@/ui/hooks/usePlayer'

interface SexualSelectionBarChartProps {
  stats: SexualSelectionStats
}

export function SexualSelectionBarChart({ stats }: SexualSelectionBarChartProps) {
  const data = [
    { color: 'Orange', successes: stats.orange, fill: '#f97316' },
    { color: 'Blue',   successes: stats.blue,   fill: '#3b82f6' },
    { color: 'Yellow', successes: stats.yellow, fill: '#eab308' },
  ]

  return (
    <div className="flex h-full flex-col">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-nss-muted">
        Bonus Reproductions (L3)
      </p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
          <XAxis dataKey="color" tick={{ fontSize: 9, fill: '#6b7280' }} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: '#1a1a2e', border: '1px solid #2d2d44', borderRadius: 4, fontSize: 10 }}
            labelStyle={{ color: '#a0a0b8' }}
            itemStyle={{ color: '#e0e0f0' }}
          />
          <Bar dataKey="successes" name="Enabled Successes" isAnimationActive={false}>
            {data.map((d) => (
              <Cell key={d.color} fill={d.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
