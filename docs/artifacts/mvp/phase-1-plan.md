# Phase 1 Implementation Plan — Basic Service & UI Layout Initialization

> **Branch:** `phase-1` (merges into `mvp`)
> **Artifacts directory:** `docs/artifacts/mvp/`
> **Prerequisites:** All proposals in `review-proposals.md` are reviewed

---

## Objective

Scaffold the full project structure, implement base class skeletons for all services defined in the architecture, build the static UI layout, set up the 2D organism display, and establish the test harness. No simulation logic runs at the end of this phase — the app renders the full layout with placeholder data.

---

## Directory Structure (target end of phase)

```
packages/node/
├── src/
│   ├── simulation/
│   │   ├── core/
│   │   │   ├── Simulation.ts          # abstract base
│   │   │   ├── SimulationLevel.ts     # abstract intermediate
│   │   │   ├── Lizard.ts              # base lizard
│   │   │   ├── Player.ts              # state machine
│   │   │   ├── PlayerState.ts         # enum
│   │   │   └── Addon.ts               # abstract addon
│   │   └── stats/
│   │       ├── Stats.ts               # service
│   │       └── Distribution.ts        # struct + types
│   ├── ui/
│   │   ├── adapters/
│   │   │   └── UISimulationAdapter.ts # generic adapter interface
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.tsx      # 2-row layout shell
│   │   │   │   ├── OrganismPanel.tsx  # organism display container
│   │   │   │   ├── PlotsPanel.tsx     # charts container
│   │   │   │   ├── ControlsPanel.tsx  # timeline + controls container
│   │   │   │   └── ParamsPanel.tsx    # param accordions container
│   │   │   ├── display/
│   │   │   │   ├── OrganismDisplay.tsx       # Canvas wrapper component
│   │   │   │   └── Canvas2DRenderer.ts       # DisplayRenderer implementation
│   │   │   └── controls/
│   │   │       └── SimulationControls.tsx    # play/pause/restart/start buttons
│   │   └── hooks/
│   │       └── usePlayer.ts           # React hook wrapping Player
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   └── stats/
│       └── Stats.test.ts
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── index.html
```

---

## Commits

### Commit 1 — `chore: scaffold Vite React TS app with Bun`

**Tasks:**
- Init Vite + React + TypeScript app inside `packages/node/` using Bun: `bun create vite . --template react-ts`
- Install dependencies: `tailwindcss`, `@tailwindcss/vite`, `shadcn/ui` (via CLI), `recharts`, `vitest`, `@testing-library/react`
- Configure `tailwind.config.ts` with custom dark palette:
  ```ts
  colors: {
    nss: {
      bg: '#0f0f0f',
      surface: '#1a1a1a',
      border: '#2a2a2a',
      text: '#f5f5f5',
      orange: '#f97316',
      blue: '#3b82f6',
      yellow: '#eab308',
      white: '#ffffff',
    }
  }
  ```
- Set dark mode as default in `index.css` and `tailwind.config.ts`
- Configure `vite.config.ts` with test config pointing to `tests/` dir
- Verify `bun run dev` starts and `bun run test` runs (empty suite)

**Files touched:** `package.json`, `vite.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `index.html`, `index.css`

---

### Commit 2 — `feat: add base simulation service skeletons`

**Tasks:**
- Create `Distribution.ts`:
  ```ts
  export type DistributionType = 'normal' | 'exponential'
  export interface DistributionParams { mean?: number; stddev?: number; lambda?: number }
  export interface Distribution { type: DistributionType; params: DistributionParams }
  ```
- Create `Stats.ts` — skeleton only, methods throw `NotImplementedError`:
  ```ts
  sample(distribution: Distribution): number
  getProbability(distribution: Distribution, value: number): number
  ```
- Create `Lizard.ts` — base class with `id: string`, `x: number`, `y: number`
- Create `PlayerState.ts` — enum: `IDLE | RUNNING | PAUSED | ENDED`
- Create `Addon.ts` — abstract class with `abstract apply(simulation: SimulationLevel): void`
- Create `Simulation.ts` — abstract class with protected `lizards: Lizard[]`, abstract `computeDeathProbability`, `computeReproductionProbability`, `initSimulation`, `tick`
- Create `SimulationLevel.ts` — abstract class extending `Simulation`, adds `params: SimulationLevelParams[]` (define `SimulationLevelParams` struct inline for now)
- Create `Player.ts` — skeleton with `state: PlayerState`, `simulation: SimulationLevel | null`, `addons: Addon[]`, stub methods `play()`, `pause()`, `restart()`, private `initSimulation()`, `tickSimulation()`
- Create `UISimulationAdapter.ts` — generic interface:
  ```ts
  interface UISimulationAdapter<T extends SimulationLevel> {
    getParamDefinitions(): ParamDefinition[]
    getPlotSeries(): PlotSeries[]
    getMetrics(): MetricSnapshot
  }
  ```
  Define `ParamDefinition`, `PlotSeries`, `MetricSnapshot` structs in same file for now

**Files touched:** all new files in `src/simulation/core/`, `src/simulation/stats/`, `src/ui/adapters/`

---

### Commit 3 — `feat: add static 2-row UI layout`

**Tasks:**
- Create `AppLayout.tsx` — 2-row flexbox/grid layout:
  - Row 1: `h-[70vh]` — two columns: `OrganismPanel` (60%) + `PlotsPanel` (40%)
  - Row 2: `h-[30vh]` — two columns: `ControlsPanel` (50%) + `ParamsPanel` (50%)
- Create `OrganismPanel.tsx`, `PlotsPanel.tsx`, `ControlsPanel.tsx`, `ParamsPanel.tsx` — each renders a styled `shadcn/ui` card with a placeholder label using `nss-*` palette colors
- Wire into `App.tsx` with dark background (`bg-nss-bg`)
- Verify layout renders correctly at 1280px+ viewport

**Files touched:** `App.tsx`, all layout components

---

### Commit 4 — `feat: add Canvas 2D organism display with DisplayRenderer interface`

**Tasks:**
- Define `DisplayRenderer` interface:
  ```ts
  interface DisplayRenderer {
    render(lizards: Lizard[], canvas: HTMLCanvasElement): void
    clear(canvas: HTMLCanvasElement): void
  }
  ```
- Implement `Canvas2DRenderer.ts` — draws each lizard as a filled circle at `(lizard.x, lizard.y)` with a `color` property (default white). Circle radius: 4px.
- Create `OrganismDisplay.tsx` — React component that:
  - Holds a `ref` to `HTMLCanvasElement`
  - Accepts `lizards: Lizard[]` and `renderer: DisplayRenderer` as props
  - Calls `renderer.render(lizards, canvas)` on each render
  - Fills the full `OrganismPanel` dimensions
- Mount with placeholder empty lizard array in `OrganismPanel.tsx`

**Files touched:** `src/ui/components/display/OrganismDisplay.tsx`, `Canvas2DRenderer.ts`

---

### Commit 5 — `feat: add simulation controls UI component`

**Tasks:**
- Create `SimulationControls.tsx` with four buttons (shadcn/ui `Button`):
  - **Start** — visible and enabled only when `state === IDLE`
  - **Play** / **Pause** — toggles based on `state === RUNNING` vs `PAUSED`
  - **Restart** — always available after start
- Accept `state: PlayerState` and callbacks `onStart`, `onPlay`, `onPause`, `onRestart` as props
- Mount in `ControlsPanel.tsx` with hardcoded `IDLE` state for now
- Add a generation counter display: `Generation: 0 / 0`

**Files touched:** `src/ui/components/controls/SimulationControls.tsx`, `ControlsPanel.tsx`

---

### Commit 6 — `feat: add usePlayer hook skeleton`

**Tasks:**
- Create `usePlayer.ts` hook that:
  - Instantiates and holds a `Player` instance in a `useRef`
  - Exposes `state: PlayerState`, `generation: number`, and `lizards: Lizard[]` as React state
  - Exposes `start()`, `play()`, `pause()`, `restart()` callbacks that delegate to `Player`
  - Does **not** start a simulation loop yet (that's Phase 2)
- Wire `usePlayer` into `App.tsx` and pass state/callbacks down to `SimulationControls`

**Files touched:** `src/ui/hooks/usePlayer.ts`, `App.tsx`

---

### Commit 7 — `test: add Stats service unit tests`

**Tasks:**
- Write unit tests in `tests/stats/Stats.test.ts` for:
  - `Stats.sample()` with normal distribution — verifies output is a number
  - `Stats.sample()` with exponential distribution — verifies output ≥ 0
  - `Stats.getProbability()` normal — verifies probability at mean is highest
  - `Stats.getProbability()` exponential — verifies probability decreases with distance from 0
  - Edge cases: zero stddev, negative lambda (should throw)
- **Note:** Tests will fail until Phase 2 implements `Stats`. That is intentional — these define the contract.
- Run `bun run test` and verify tests are discovered (even if failing)

**Files touched:** `tests/stats/Stats.test.ts`

---

## Definition of Done — Phase 1

- [ ] `bun run dev` starts the app and shows the full 2-row dark-themed layout
- [ ] Organism display canvas renders (empty, dark background)
- [ ] Simulation controls render with correct button states for `IDLE`
- [ ] All base class skeletons exist and TypeScript compiles with zero errors (`bun run typecheck`)
- [ ] `bun run test` discovers all tests (Stats tests fail — expected, they define Phase 2 contract)
- [ ] No three.js dependency installed
- [ ] Custom Tailwind palette (`nss-*`) is functional across all components
