# Phase 3 Implementation Plan — Level 2 + Level 3 Simulation Modelling

> **Branch:** `phase-3` (merges into `mvp`)
> **Artifacts directory:** `docs/artifacts/mvp/`
> **Prerequisites:** Phase 2 complete and merged to `mvp`. Proposals P-M2, P-M3, P-M4, P-M5 in `review-proposals.md` resolved.

---

## Objective

Implement the Level 2 (RPS / negative frequency-dependent selection) simulation with three lizard colors (orange, blue, yellow), add the Level 3 sexual selection addon, build the accordioned param panel for both levels, add per-color population plots and the Level 3 cumulative bar chart. By the end of this phase the app supports both Level 1 and Level 2+3 simulation modes selectable from the UI.

---

## Key Mechanics Recap

### Level 2
- Three color strategies: **orange** (aggressive), **blue** (cooperative), **yellow** (sneaky)
- Each lizard has `colorWeights: { orange, blue, yellow }` summing to 1.0 (see P-M2)
- Neighborhood radius `r` determines spatial interactions (see P-M3)
- RPS reproduction probability modifiers per dominant color (see P-M4):
  - **Orange**: high base repro prob; no neighborhood modifier
  - **Blue**: moderate base repro prob; blocked (×0) when ≥1 orange lizard within radius `r`
  - **Yellow**: low base repro prob; bonus proportional to orange lizard count in neighborhood
- Death mechanics same as Level 1 (shared through `SimulationLevel`)
- Population guards from P-M1 still apply per color

### Level 3 (Addon)
- `SexualSelectionAddon` runs after each `simulation.tick()`
- Adds bonus repro probability per color: `bonus_c = f(1 - frequency_c)` via distribution `D_par`
- Tracks `enabledReproductionSuccesses_c` — cumulative count of successes that needed the bonus
- Displayed as a cumulative bar chart (not time-series)

---

## Commits

### Commit 1 — `feat: implement Level2Lizard with color weight vector`

**Tasks:**
- Create `src/simulation/levels/level2/Level2Lizard.ts` extending `Lizard`:
  ```ts
  class Level2Lizard extends Lizard {
    colorWeights: { orange: number; blue: number; yellow: number }
    get dominantColor(): 'orange' | 'blue' | 'yellow'
  }
  ```
- `dominantColor` returns the key with highest weight
- `color` property (used by `Canvas2DRenderer`) returns `dominantColor`
- `reproduce(params: Level2SimulationParams): Level2Lizard`:
  - If `params.discreteMode === true`: offspring inherits parent's dominant color at 1.0, others at 0.0
  - Otherwise: offspring weights sampled from a narrow normal centered on parent's weights, then re-normalised to sum to 1.0
- Position `(x, y)` randomly placed within world bounds at init

**Files touched:** `src/simulation/levels/level2/Level2Lizard.ts`

---

### Commit 2 — `feat: implement neighborhood query service`

**Tasks:**
- Create `src/simulation/levels/level2/Neighborhood.ts`:
  ```ts
  function getNeighbors(lizard: Level2Lizard, all: Level2Lizard[], radius: number): Level2Lizard[]
  ```
  - Returns all lizards (excluding self) within Euclidean distance `radius`
  - Brute-force O(n²) for MVP
- Add helper:
  ```ts
  function countByDominantColor(lizards: Level2Lizard[]): Record<'orange'|'blue'|'yellow', number>
  ```
- Unit-tested in Phase 3 test commit

**Files touched:** `src/simulation/levels/level2/Neighborhood.ts`

---

### Commit 3 — `feat: implement Level2SimulationParams and Level2Simulation`

**Tasks:**
- Create `Level2SimulationParams.ts` extending `SimulationLevelParams`:
  ```ts
  interface Level2SimulationParams extends SimulationLevelParams {
    // Global params
    initialPopulation: number           // default: 150 (50 per color)
    generationLimit: number             // default: 200
    tickRateMs: number                  // default: 500ms
    maxPopulation: number               // default: 600
    extinctionGuardFactor: number
    extinctionThresholdRatio: number
    // Shared distributions
    bodySizeDistribution: Distribution
    deathDistribution: Distribution
    deathThreshold: number
    // Color base reproduction probabilities
    orangeBaseReproProb: number         // default: 0.7
    blueBaseReproProb: number           // default: 0.5
    yellowBaseReproProb: number         // default: 0.25
    // Neighborhood
    neighborhoodRadius: number          // default: 50 (world units)
    // Yellow bonus formula
    yellowBonusPerOrangeNeighbor: number // default: 0.05
    // Trait inheritance
    discreteMode: boolean               // default: false
    mutationStddev: number              // default: 0.05
  }
  ```
- Create `Level2Simulation.ts` extending `SimulationLevel`:
  - `initSimulation()`: spawn `initialPopulation / 3` lizards per dominant color, random positions
  - `computeDeathProbability(lizard)`: same as Level 1 (sample from `deathDistribution`)
  - `computeReproductionProbability(lizard)`: returns base prob for dominant color + neighborhood modifier:
    - **Orange**: `orangeBaseReproProb` (no modifier)
    - **Blue**: `blueBaseReproProb * (orangeNeighborCount === 0 ? 1 : 0)`
    - **Yellow**: `yellowBaseReproProb + orangeNeighborCount * yellowBonusPerOrangeNeighbor`
  - `tick()`:
    1. Extinction guard check (per total population)
    2. Death phase: filter dead lizards
    3. Reproduction phase: each survivor rolls reproduction, collects offspring
    4. Max population cap (total across all colors)
    5. Append offspring, increment generation
  - `getMetrics()`: returns `{ totalPopulation, populationByColor: { orange, blue, yellow }, generation, maxPopReached: boolean, extinctionGuardActive: boolean }` — boolean flags power read-only UI guard indicators (P-M1)

**Files touched:** `src/simulation/levels/level2/Level2SimulationParams.ts`, `src/simulation/levels/level2/Level2Simulation.ts`

---

### Commit 4 — `feat: implement SexualSelectionAddon (Level 3)`

**Tasks:**
- Create `src/simulation/addons/SexualSelectionAddon.ts` extending `Addon`:
  ```ts
  class SexualSelectionAddon extends Addon {
    bonusDistribution: Distribution
    enabledSuccesses: { orange: number; blue: number; yellow: number }
    apply(simulation: Level2Simulation): void
  }
  ```
  - `apply()` runs **after** `simulation.tick()` each generation:
    1. Compute `frequency_c = population_c / totalPopulation` for each color
    2. For each lizard that did **not** reproduce in the last tick (track via flag on lizard):
       - Draw `bonus_c = Stats.sample(bonusDistribution) * (1 - frequency_c)`
       - Roll reproduction again using `existingReproProb + bonus_c`
       - If now succeeds: spawn offspring, increment `enabledSuccesses[dominantColor]`
  - Add `lastTickReproduced: boolean` ephemeral flag to `Level2Lizard` (reset each tick)
- Register `SexualSelectionAddon` in `Player.addons` when Level 3 checkbox is enabled

**Files touched:** `src/simulation/addons/SexualSelectionAddon.ts`, `Level2Lizard.ts` (add flag)

---

### Commit 5 — `feat: add level selector, Level2UIAdapter, and update usePlayer for multi-level`

**Tasks:**
- Create `src/ui/adapters/Level2UIAdapter.ts` implementing `UISimulationAdapter<Level2Simulation>` (P-A5):
  - `getParamDefinitions()` — returns `ParamDefinition[]` for the full `Level2SimulationParams` shape (neighborhood radius, color base probabilities, discrete mode toggle, mutation stddev, bonus distribution)
  - `getPlotSeries()` — returns `PlotSeries[]` descriptors for the three per-color population lines and (when Level 3 active) the cumulative bar chart series
  - `getMetrics()` — delegates to `Level2Simulation.getMetrics()` + `SexualSelectionAddon.enabledSuccesses` when addon is active; returns a `MetricSnapshot`
- Add `simulationLevel: 1 | 2` state to `usePlayer` (default 1)
- `usePlayer.setLevel(level)`:
  - Instantiates `Level1Simulation` or `Level2Simulation` accordingly
  - Swaps active `UISimulationAdapter` to `Level1UIAdapter` or `Level2UIAdapter`
  - Resets `Player` to `IDLE`
- Add `sexualSelectionEnabled: boolean` state to `usePlayer`:
  - When `true` and level is 2, adds `SexualSelectionAddon` to `Player.addons`
  - When `false`, removes it
- Expose from `usePlayer`: `level`, `setLevel()`, `adapter` (current `UISimulationAdapter`), `sexualSelectionEnabled`, `setSexualSelectionEnabled()`
- Pass these down from `App.tsx`

**Files touched:** `src/ui/hooks/usePlayer.ts`, `src/ui/adapters/Level2UIAdapter.ts`, `App.tsx`

---

### Commit 6 — `feat: Level 2/3 param panel with accordions`

**Tasks:**
- Create `src/ui/components/params/Level2ParamsPanel.tsx`:
  - **Global params** section: initial population, generation limit, tick rate (same as Level 1, locked-on-start rule applies)
  - **Level selector** at top: shadcn/ui `Select` — "Level 1: Directional Selection" / "Level 2: RPS Selection" — switching resets simulation
  - **Addon checkbox**: "Level 3: Sexual Selection" — only enabled when Level 2 is active
  - **Death Distribution** accordion: same as Level 1
  - **Color Reproduction Probabilities** accordion:
    - Orange base prob slider
    - Blue base prob slider
    - Yellow base prob + bonus-per-orange-neighbor slider
  - **Neighborhood** accordion:
    - Radius slider (5–200 world units, default 50)
  - **Trait Inheritance** accordion:
    - Discrete mode toggle
    - Mutation stddev slider (hidden when discrete mode on)
  - **Level 3: Sexual Selection** accordion (visible only when addon enabled):
    - Bonus distribution type selector
    - Distribution params (mean/stddev or lambda)
  - **Population Guards status** (read-only, always visible — P-M1):
    - `Max population reached` badge — lights up (amber) when total population equals `maxPopulation` and reproduction is being skipped
    - `Extinction guard active` badge — lights up (red) when population has dropped below `extinctionThresholdRatio × initialPopulation` and the death threshold relaxation is in effect
    - Derived from `MetricSnapshot` via `Level2UIAdapter.getMetrics()`; no simulation internals leak into the UI
- `ParamsPanel.tsx` renders `Level1ParamsPanel` or `Level2ParamsPanel` based on active level

**Files touched:** `src/ui/components/params/Level2ParamsPanel.tsx`, `ParamsPanel.tsx`

---

### Commit 7 — `feat: per-color population plots and Level 3 bar chart`

**Tasks:**
- Update `PlotsPanel.tsx` to render different plots based on active level:
  - **Level 1**: Population plot + Body size plot (from Phase 2)
  - **Level 2**: Per-color population plot + (when L3 active) cumulative bar chart
- Create `src/ui/components/plots/ColorPopulationPlot.tsx`:
  - `LineChart` with three lines: orange (`nss-orange`), blue (`nss-blue`), yellow (`nss-yellow`)
  - x-axis = generation, y-axis = population count per color
  - Receives `history: Array<{ generation: number; orange: number; blue: number; yellow: number }>`
- Create `src/ui/components/plots/SexualSelectionBarChart.tsx`:
  - `BarChart` (Recharts) with three bars (one per color)
  - y-axis = cumulative `enabledSuccesses` count
  - Does **not** update on time axis — re-renders with latest cumulative values each tick
  - Renders only when Level 3 addon is active
- `usePlayer` accumulates `colorHistory` and exposes `sexualSelectionStats` from `SexualSelectionAddon`

**Files touched:** `src/ui/components/plots/ColorPopulationPlot.tsx`, `SexualSelectionBarChart.tsx`, `PlotsPanel.tsx`

---

### Commit 8 — `feat: update organism display for Level 2 multi-color lizards`

**Tasks:**
- Update `Canvas2DRenderer.render()`:
  - Color mapping: `'orange' → nss-orange hex`, `'blue' → nss-blue hex`, `'yellow' → nss-yellow hex`
  - For continuous mode: blend circle fill color using `colorWeights` (linear interpolation across three colors)
  - Circle radius: fixed 4px for Level 2 (body size is less relevant visually here)
- Verify display correctly shows population shift as colors cycle over generations

**Files touched:** `src/ui/components/display/Canvas2DRenderer.ts`

---

### Commit 9 — `test: Level 2 simulation and addon unit tests`

**Tasks:**
- `tests/level2/Neighborhood.test.ts`:
  - `getNeighbors` returns only lizards within radius
  - Excludes self
  - Returns empty array when none in range
- `tests/level2/Level2Simulation.test.ts`:
  - Blue lizard reproduction blocked when orange neighbor within radius
  - Yellow lizard receives bonus when orange neighbor within radius
  - Over 50 ticks: population oscillates (not monotone) — validates RPS cycle
  - Max population cap respected across all colors
  - Discrete mode: all offspring share parent's dominant color at weight 1.0
- `tests/level2/SexualSelectionAddon.test.ts`:
  - Rare color receives higher bonus than common color
  - `enabledSuccesses` increments only when bonus caused the reproduction
  - Addon does not affect Level 1 simulation (type guard test)

**Files touched:** `tests/level2/Neighborhood.test.ts`, `Level2Simulation.test.ts`, `SexualSelectionAddon.test.ts`

---

## Definition of Done — Phase 3

- [ ] Level selector switches between Level 1 and Level 2 simulations correctly
- [ ] Level 2 simulation shows RPS oscillation in per-color population plot over sufficient generations
- [ ] Blue lizard reproduction is visibly suppressed when orange lizards are nearby (observable in display)
- [ ] Yellow population grows when orange is dominant, verifiable in plots
- [ ] Level 3 checkbox activates sexual selection addon; rare colors show reproduction bonus in bar chart
- [ ] Accordion params panel for Level 2/3 updates simulation live
- [ ] Discrete mode toggle works — offspring always inherit parent's dominant color
- [ ] Organism display renders orange/blue/yellow dots correctly, blended in continuous mode
- [ ] `Max population reached` and `Extinction guard active` badges work correctly for Level 2 (P-M1)
- [ ] `Level2UIAdapter` drives param and plot data; UI does not reference `Level2Simulation` internals directly (P-A5)
- [ ] `Level2SimulationParams` correctly extends `SimulationLevelParams`
- [ ] All Level 2 and addon unit tests pass
- [ ] All prior Phase 1 and Phase 2 tests still pass
- [ ] TypeScript zero errors
