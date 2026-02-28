# Phase 2 Implementation Plan — Level 1 Simulation Modelling

> **Branch:** `phase-2` (merges into `mvp`)
> **Artifacts directory:** `docs/artifacts/mvp/`
> **Prerequisites:** Phase 1 complete and merged to `mvp`. All P-A* and P-M1 proposals in `review-proposals.md` resolved.

---

## Objective

Implement the full Level 1 simulation (single trait, directional selection), wire it into a running `Player` state machine, connect it to the UI param panel and Recharts plots, and link the organism display to real lizard positions. By the end of this phase the app runs a live, interactive Level 1 simulation.

---

## Key Mechanics Recap (Level 1)

- Population of **orange lizards** only
- Each lizard has a `bodySize` sampled from $\mathcal{D}_{bz}$
- Each tick:
  1. Each lizard draws a death probability from $\mathcal{D}_{pd}$; if `deathProb >= deathThreshold` → lizard dies
  2. Each surviving lizard draws a reproduction probability from $\mathcal{D}_{pr}(bodySize)$; if it reproduces, a new lizard is born with `bodySize` sampled with slight mutation from parent
- Key metrics tracked per generation: `totalPopulation`, `averageBodySize`
- Population guards from **P-M1** apply

---

## Commits

### Commit 1 — `feat: implement Stats service (normal + exponential)`

**Tasks:**
- Implement `Stats.sample(distribution: Distribution): number`:
  - `normal`: Box-Muller transform → `mean + stddev * z`
  - `exponential`: inverse CDF → `-ln(1 - U) / lambda`
- Implement `Stats.getProbability(distribution: Distribution, value: number): number`:
  - `normal`: Gaussian PDF formula
  - `exponential`: PDF formula `lambda * e^(-lambda * value)` for `value >= 0`, else 0
- All Stats methods are **pure functions** (no state) — export as a singleton service object
- All `Stats` unit tests from Phase 1 must now pass

**Files touched:** `src/simulation/stats/Stats.ts`

---

### Commit 2 — `feat: implement Level1Lizard`

**Tasks:**
- Create `src/simulation/levels/level1/Level1Lizard.ts` extending `Lizard`:
  ```ts
  class Level1Lizard extends Lizard {
    bodySize: number
    color: 'orange' = 'orange'
  }
  ```
- `bodySize` is set at construction via `Stats.sample(bodySize distribution)`
- Add `reproduce(params: Level1SimulationParams): Level1Lizard` — returns a new lizard with `bodySize` sampled from a normal distribution centered on parent's `bodySize` with a small `mutationStddev` param
- Position `(x, y)` is randomly assigned within the display bounds at init

**Files touched:** `src/simulation/levels/level1/Level1Lizard.ts`

---

### Commit 3 — `feat: implement Level1SimulationParams and Level1Simulation`

**Tasks:**
- Create `Level1SimulationParams.ts` extending `SimulationLevelParams`:
  ```ts
  interface Level1SimulationParams {
    // Global params (all levels)
    initialPopulation: number       // default: 100, max: 500
    generationLimit: number         // default: 100
    tickRateMs: number              // default: 500ms
    // Level 1 specific
    bodySizeDistribution: Distribution     // default: normal(mean=5, stddev=1)
    deathDistribution: Distribution        // default: normal(mean=0.5, stddev=0.15)
    deathThreshold: number                 // default: 0.6
    reproductionDistribution: Distribution // default: normal(mean=0.5, stddev=0.1)
    mutationStddev: number                 // default: 0.1
    // Population guards (P-M1)
    maxPopulation: number                  // default: 500 (hard-locked)
    extinctionGuardFactor: number          // default: 0.5 (relaxes death threshold)
    extinctionThresholdRatio: number       // default: 0.1 (10% of initial pop)
  }
  ```
- Create `Level1Simulation.ts` extending `SimulationLevel`:
  - `initSimulation()`: spawn `initialPopulation` lizards, assign random positions
  - `computeDeathProbability(lizard)`: sample from `deathDistribution`
  - `computeReproductionProbability(lizard)`: sample from `reproductionDistribution`, scaled by lizard's `bodySize` relative to population mean (larger = higher probability)
  - `tick()`:
    1. Apply extinction guard if population < threshold
    2. Compute death for each lizard → filter out dead ones
    3. Compute reproduction for each surviving lizard → collect new lizards
    4. Apply `maxPopulation` cap on new lizards list
    5. Append new lizards, increment `generation`
  - `getMetrics()`: return `{ totalPopulation, averageBodySize, generation, maxPopReached: boolean, extinctionGuardActive: boolean }` — the two boolean flags power the read-only UI guard indicators (P-M1)

**Files touched:** `src/simulation/levels/level1/Level1SimulationParams.ts`, `src/simulation/levels/level1/Level1Simulation.ts`

---

### Commit 4 — `feat: implement Player state machine with simulation loop`

**Tasks:**
- Fully implement `Player.ts`:
  - `state` transitions: `IDLE → RUNNING` (on `play()`), `RUNNING → PAUSED` (on `pause()`), `PAUSED → RUNNING` (on `play()`), any → `IDLE` (on `restart()`), `RUNNING → ENDED` (when `generation >= generationLimit`)
  - `initSimulation()`: calls `simulation.initSimulation()`, resets addons, resets generation counter
  - `tickSimulation()`: calls `simulation.tick()`, then for each addon calls `addon.apply(simulation)`, emits updated state
  - Simulation loop: uses `setInterval` (interval = `tickRateMs`) when `RUNNING`, clears on `PAUSED`/`ENDED`/`IDLE`
  - `Player` is a plain TS class — no React dependency. It uses a callback `onTick: (state: PlayerTickResult) => void` for UI updates
  - Define `PlayerTickResult`: `{ lizards: Lizard[], generation: number, metrics: MetricSnapshot, playerState: PlayerState }`

**Files touched:** `src/simulation/core/Player.ts`

---

### Commit 5 — `feat: wire usePlayer hook to Level1Simulation`

**Tasks:**
- Update `usePlayer.ts` hook:
  - Construct `Level1Simulation` with default `Level1SimulationParams`
  - Pass to `Player` constructor
  - `Player.onTick` callback updates React state: `lizards`, `generation`, `metrics`, `playerState`
  - Expose `updateParams(partial: Partial<Level1SimulationParams>)` — updates simulation params live without restart
  - `start()` → `player.play()` (initialises + starts loop)
  - `pause()` / `play()` / `restart()` delegate to `Player`
- Create `src/ui/adapters/Level1UIAdapter.ts` implementing `UISimulationAdapter<Level1Simulation>`:
  - `getParamDefinitions()` — returns the full `Level1SimulationParams` shape as typed `ParamDefinition[]` (used to drive the param panel generically)
  - `getPlotSeries()` — returns `PlotSeries[]` descriptors for the population plot and body size plot
  - `getMetrics()` — delegates to `Level1Simulation.getMetrics()`, returns a `MetricSnapshot`
  - Instantiate `Level1UIAdapter` inside `usePlayer` and expose it; param panel and plot panel consume it via the adapter interface rather than referencing `Level1Simulation` directly
- Pass all state and adapter down from `App.tsx` to layout panels

**Files touched:** `src/ui/hooks/usePlayer.ts`, `src/ui/adapters/Level1UIAdapter.ts`, `App.tsx`

---

### Commit 6 — `feat: Level 1 param panel`

**Tasks:**
- Create `src/ui/components/params/Level1ParamsPanel.tsx` inside `ParamsPanel.tsx`:
  - **Locked after start** section:
    - Initial population slider (1–500, default 100)
  - **General** section:
    - Generation limit number input (min = current generation, default 100)
    - Tick rate slider (100ms–2000ms, default 500ms)
  - **Body Size Distribution** accordion:
    - Distribution type select: `normal | exponential`
    - `mean` slider, `stddev` slider (for normal) or `lambda` slider (for exponential)
  - **Death Distribution** accordion:
    - Same pattern as body size
    - Death threshold slider (0–1, default 0.6)
  - **Reproduction Distribution** accordion:
    - Same pattern
    - Mutation stddev slider
  - **Population Guards status** (read-only, always visible — P-M1):
    - `Max population reached` badge — lights up (amber) when total population equals `maxPopulation` and reproduction is being skipped
    - `Extinction guard active` badge — lights up (red) when population has dropped below `extinctionThresholdRatio × initialPopulation` and the death threshold relaxation is in effect
    - Both indicators are derived from `MetricSnapshot` exposed via `Level1UIAdapter.getMetrics()`; no additional simulation state leaks into the UI
  - All controls call `updateParams()` from `usePlayer` on change → live update
  - Lock initial population slider when `playerState !== IDLE`

**Files touched:** `src/ui/components/params/Level1ParamsPanel.tsx`, `ParamsPanel.tsx`

---

### Commit 7 — `feat: population and body size plots (Recharts)`

**Tasks:**
- Create `src/ui/components/plots/PopulationPlot.tsx`:
  - `LineChart` (Recharts) with x-axis = generation, y-axis = total population
  - Receives `history: Array<{ generation: number; population: number }>` as prop
  - Line color: `nss-orange`
- Create `src/ui/components/plots/BodySizePlot.tsx`:
  - `LineChart` with x-axis = generation, y-axis = average body size
  - Line color: `nss-white`
- Both charts share the same container in `PlotsPanel.tsx`, stacked vertically
- `usePlayer` accumulates `history` array from each tick result
- Charts auto-scroll x-axis as generations grow (set `domain` to last N=50 generations, or all if fewer)

**Files touched:** `src/ui/components/plots/PopulationPlot.tsx`, `BodySizePlot.tsx`, `PlotsPanel.tsx`

---

### Commit 8 — `feat: wire organism display to Level 1 lizard positions`

**Tasks:**
- Update `Level1Lizard` to assign `x, y` within configurable display bounds (passed as `worldWidth`, `worldHeight` params to simulation)
- Update `Canvas2DRenderer.render()`:
  - Clear canvas each frame
  - Draw each lizard as a filled circle, color mapped to lizard's `.color` property via `nss-*` palette
  - Radius proportional to `bodySize` (clamp to 3–8px range) for Level 1 visual interest
- Update `OrganismPanel.tsx` to pass current `lizards` from `usePlayer` into `OrganismDisplay`

**Files touched:** `src/ui/components/display/Canvas2DRenderer.ts`, `OrganismPanel.tsx`, `Level1Lizard.ts`

---

### Commit 9 — `test: Level 1 simulation unit tests`

**Tasks:**
- `tests/level1/Level1Simulation.test.ts`:
  - `initSimulation` creates correct number of lizards
  - `tick` reduces population when death threshold is very low (guaranteed death)
  - `tick` grows population when reproduction probability is very high
  - `maxPopulation` cap is respected
  - Extinction guard activates and prevents die-out
  - `getMetrics().averageBodySize` trends upward over N ticks with high reproduction pressure
- `tests/level1/Level1Lizard.test.ts`:
  - `reproduce()` returns a new lizard with bodySize close to parent's

**Files touched:** `tests/level1/Level1Simulation.test.ts`, `tests/level1/Level1Lizard.test.ts`

---

## Definition of Done — Phase 2

- [ ] `bun run dev` starts and runs a live Level 1 simulation with default params
- [ ] Play / Pause / Restart / Start controls all function correctly
- [ ] Changing sliders live updates the simulation without restart (except initial population)
- [ ] Population and average body size plots update in real time
- [ ] Organism display shows orange dots, radius varies with body size
- [ ] Over time, average body size trends upward and population variance decreases (directional selection visible)
- [ ] `Max population reached` badge appears when cap is hit; `Extinction guard active` badge appears when guard fires (P-M1)
- [ ] `Level1UIAdapter` drives param and plot data; UI does not reference `Level1Simulation` internals directly (P-A5)
- [ ] All Stats unit tests pass
- [ ] All Level 1 unit tests pass
- [ ] TypeScript zero errors
