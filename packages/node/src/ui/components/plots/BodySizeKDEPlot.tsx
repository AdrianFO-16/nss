import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface BodySizeKDEPlotProps {
  snapshot: number[]
  current: number[]
}

const N_EVAL = 120   // number of x-axis evaluation points

// ── KDE maths ────────────────────────────────────────────────────────────────

function gaussianKernel(u: number): number {
  return Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI)
}

/** Silverman's rule of thumb: h = 0.9 · min(σ, IQR/1.34) · n^(−1/5) */
function silvermanBandwidth(data: number[]): number {
  const n = data.length
  if (n < 2) return 1

  const mean = data.reduce((a, b) => a + b, 0) / n
  const variance = data.reduce((s, v) => s + (v - mean) ** 2, 0) / n
  const stddev = Math.sqrt(variance)

  const sorted = [...data].sort((a, b) => a - b)
  const q1 = sorted[Math.floor(n * 0.25)]
  const q3 = sorted[Math.floor(n * 0.75)]
  const iqr = q3 - q1

  const sigma = Math.min(stddev, iqr / 1.34 || stddev)
  return Math.max(0.01, 0.9 * sigma * Math.pow(n, -0.2))
}

function evalKDE(data: number[], h: number, xs: number[]): number[] {
  const n = data.length
  if (n === 0) return xs.map(() => 0)
  return xs.map(x => data.reduce((acc, xi) => acc + gaussianKernel((x - xi) / h), 0) / (n * h))
}

// ── Component ────────────────────────────────────────────────────────────────

export function BodySizeKDEPlot({ snapshot, current }: BodySizeKDEPlotProps) {
  if (snapshot.length === 0 && current.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-nss-muted">
          Body Size Distribution (KDE)
        </p>
        <div className="flex flex-1 items-center justify-center text-xs text-nss-muted">
          Start simulation to see distribution
        </div>
      </div>
    )
  }

  const all = [...snapshot, ...current]
  const rawMin = Math.min(...all)
  const rawMax = Math.max(...all)
  const pad = (rawMax - rawMin) * 0.15 || 1
  const xMin = rawMin - pad
  const xMax = rawMax + pad

  const xs = Array.from({ length: N_EVAL }, (_, i) => xMin + (i / (N_EVAL - 1)) * (xMax - xMin))

  const hSnap = silvermanBandwidth(snapshot)
  const hCurr = silvermanBandwidth(current)

  const snapDensity = evalKDE(snapshot, hSnap, xs)
  const currDensity = evalKDE(current, hCurr, xs)

  const data = xs.map((x, i) => ({
    x: x.toFixed(2),
    initial: +snapDensity[i].toFixed(4),
    current: +currDensity[i].toFixed(4),
  }))

  return (
    <div className="flex h-full flex-col">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-nss-muted">
        Body Size Distribution (KDE)
      </p>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="kdeInitial" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6b7280" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#6b7280" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="kdeCurrent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#f97316" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="x"
            tick={{ fontSize: 8, fill: '#6b7280' }}
            tickLine={false}
            interval={Math.floor(N_EVAL / 6)}
          />
          <YAxis tick={{ fontSize: 8, fill: '#6b7280' }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: '#1a1a2e', border: '1px solid #2d2d44', borderRadius: 4, fontSize: 10 }}
            labelStyle={{ color: '#a0a0b8' }}
            labelFormatter={(v) => `Size ${v}`}
            formatter={(v: number) => v.toFixed(4)}
          />
          <Legend wrapperStyle={{ fontSize: 9, color: '#6b7280', paddingTop: 2 }} iconSize={8} />

          <Area
            type="monotone"
            dataKey="initial"
            name="Initial"
            stroke="#6b7280"
            strokeWidth={1.5}
            fill="url(#kdeInitial)"
            dot={false}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="current"
            name="Current"
            stroke="#f97316"
            strokeWidth={2}
            fill="url(#kdeCurrent)"
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
