# Architecture & Modelling Review — MVP

> **Source document:** `docs/artifacts/mvp/design-doc.md` (read-only)
> **Artifacts directory:** `docs/artifacts/mvp/`
> **Status legend:** 🔵 Proposed · ✅ Accepted · ❌ Rejected · 🟡 Needs Discussion

---

## 1. Architecture Proposals

### P-A1: Define the missing `Addon` abstract class

| | |
|---|---|
| **Proposal** | Define `Addon` as an abstract class (or interface) with a single required method: `apply(simulation: SimulationLevel): void`. Level 3 (`SexualSelectionAddon`) implements it. `Player` holds `List<Addon>` and calls `addon.apply(simulation)` after each tick. |
| **Rationale** | `Addon` is referenced in `Player`'s composition and in the class diagram but is never defined. Without a contract, there is no way to implement addons consistently or test them in isolation. Level 3 is explicitly labelled *"Add on parameter"* in the design doc — this maps directly to this pattern. |
| **Decision** | ✅ Accepted |

---

### P-A2: Clarify `SimulationLevel` role in the inheritance chain

| | |
|---|---|
| **Proposal** | Treat `SimulationLevel` as the **abstract intermediate class** between `Simulation` (base) and the concrete implementations `Level1Simulation` and `Level2Simulation`. The diagram's `<<service>>` label is misleading — replace it mentally with `<<abstract>>`. Concrete classes extend `SimulationLevel`, which extends `Simulation`. |
| **Rationale** | The diagram shows `Simulation <|-- SimulationLevel` and `SimulationLevel *-- SimulationLevelParams`, implying `SimulationLevel` adds param-awareness. The concrete levels (Level 1, Level 2) are what truly implement `computeDeathProbability` and `computeReproductionProbability`. The `<<service>>` tag appears to be a diagram notation error. |
| **Decision** | ✅ Accepted |

---

### P-A3: Resolve duplicate `Lizard` composition

| | |
|---|---|
| **Proposal** | Remove the `Simulation *-- Lizard` composition arrow. Keep only `SimulationLevel *-- Lizard`. In the base `Simulation` class, declare `lizards` as a `protected` field. The diagram composition should only appear at the level that actually manages lizard lifecycle. |
| **Rationale** | Since `SimulationLevel` extends `Simulation`, showing `Lizard` composed into both creates the false impression that two separate lizard lists exist. The field lives in `Simulation`, but the ownership relationship in the diagram should be expressed at `SimulationLevel` since it is where lizards are typed and specialised per level. |
| **Decision** | ✅ Accepted |

---

### P-A4: Extend `Stats` service interface

| | |
|---|---|
| **Proposal** | Add a `sample(distribution: Distribution): number` method to `Stats` alongside `getProbability(distribution: Distribution, value: number): number`. The existing diagram only shows `getProbability(Distribution)` which is ambiguous. |
| **Rationale** | Body size initialisation (`bodySize ~ D_bz`), offspring trait inheritance, and death/reproduction probability rolls all require **drawing samples** from distributions — not just evaluating probability density. These are two distinct operations and must both exist on `Stats`. |
| **Decision** | ✅ Accepted |

---

### P-A5: Formalise `UISimulationAdapter` interface

| | |
|---|---|
| **Proposal** | `UISimulationAdapter<T extends SimulationLevel>` exposes three methods: `getParamDefinitions(): ParamDefinition[]` (drives the param sliders/controls panel), `getPlotSeries(): PlotSeries[]` (drives Recharts charts), and `getMetrics(): MetricSnapshot` (drives any live KPI display). Each concrete level registers its own adapter. The UI renders generically from these outputs. |
| **Rationale** | The diagram describes this as adapting "params and plot section based on Simulation Level" but gives no interface detail. Without a concrete contract, the UI will be tightly coupled to each level's internal structure, making it hard to add new levels or test UI in isolation. |
| **Decision** | ✅ Accepted |

---

### P-A6: Organism display — defer three.js, use Canvas 2D with swappable interface

| | |
|---|---|
| **Proposal** | Implement `OrganismDisplay` as a React component backed by an HTML Canvas 2D context. Define a `DisplayRenderer` interface with `render(lizards: Lizard[], canvas: HTMLCanvasElement): void` so it can be swapped for a three.js renderer in a future iteration. Do not install three.js yet. |
| **Rationale** | The design doc says *"prepare for using organism display visualization using three.js. For now, only a plane with no orbiting"* and *"just use dots in a plane"*. Canvas 2D handles this trivially and avoids unnecessary bundle weight. The interface abstraction fulfils the "prepare for three.js" requirement without actually using it. |
| **Decision** | ✅ Accepted |

---

## 2. Modelling Proposals

### P-M1: Population stability safeguards (Open Question 1)

| | |
|---|---|
| **Proposal** | Implement three guards: **(1)** a hard `maxPopulation` cap (user-configurable, hard-locked maximum from design doc) — reproduction is skipped when cap is reached; **(2)** a minimum survival floor — when total population drops below a configurable threshold (e.g. 10% of initial population), the death threshold parameter is temporarily relaxed by a configurable factor to prevent extinction; **(3)** expose these as read-only indicators in the UI so users can observe when guards are active. |
| **Rationale** | Without these guards, a user setting aggressive death probability parameters will wipe the population in 2–3 generations, breaking the educational experience entirely. The design doc acknowledges this in Open Question 1. The guards should be transparent (visible in UI) so students can understand why the population doesn't collapse. |
| **Decision** | ✅ Accepted |

---

### P-M2: Level 2 — `Lizard` color trait as a normalised weight vector

| | |
|---|---|
| **Proposal** | In Level 2, each `Lizard` carries `colorWeights: { orange: number; blue: number; yellow: number }` summing to 1.0. A `dominantColor()` getter returns the color with the highest weight — used for display and interaction logic. On birth, offspring weights are sampled from the parent's weights using a configurable distribution (defaulting to a narrow normal centered on the parent's dominant color). A `discreteMode` flag forces all offspring to inherit the parent's dominant color at weight 1.0, satisfying the "100% yellow births 100% yellow" discrete case. |
| **Rationale** | The design doc describes both a continuous case (98% yellow / 1% blue / 1% orange) and a discrete case (100% yellow). A unified weight vector handles both without branching in the simulation logic. |
| **Decision** | ✅ Accepted |

---

### P-M3: Level 2 — Neighborhood as a configurable spatial radius

| | |
|---|---|
| **Proposal** | Lizards have a 2D position `(x, y)` on the simulation plane. Each tick, neighborhood queries are resolved as: all lizards within Euclidean distance `r` (configurable parameter). Use a simple brute-force O(n²) scan for MVP (population sizes are small). Expose `r` as a user slider in Level 2's param panel. |
| **Rationale** | The design doc specifies *"Env is a neighborhood of radius r"* as a parameter. Blue lizards cannot reproduce when at least 1 orange lizard is within radius `r`. Yellow lizards gain reproduction bonus based on orange lizards within radius `r`. The brute-force approach is sufficient for MVP population sizes (hundreds, not thousands). |
| **Decision** | ✅ Accepted |

---

### P-M4: Level 2 — Reproduction probability mechanics per color

| | |
|---|---|
| **Proposal** | Define base reproduction probabilities per dominant color, then apply environmental modifiers: **Orange** — high base reproduction probability (controls several females); no neighborhood modifier. **Blue** — moderate constant base probability; multiplied by 0 (blocked) when ≥1 orange lizard is within radius `r`. **Yellow** — low base probability; bonus added proportional to the count of orange lizards in neighborhood (their guarded females become available). When Orange is common, Yellow bonus is large → Yellow population grows. When Yellow is common, Blue has no orange nearby → Blue reproduces freely → Blue grows. When Blue is common, Orange faces no yellow interference → Orange dominates. This implements the RPS cycle. |
| **Rationale** | This is the core mechanic the design doc requires: *"Simulation must ensure: Orange common → Yellow does better; Yellow common → Blue does better; Blue common → Orange does better."* Explicit probability modifiers per color tied to neighborhood composition are the most direct way to enforce this. |
| **Decision** | ✅ Accepted |

---

### P-M5: Level 3 — Sexual selection addon bonus formula

| | |
|---|---|
| **Proposal** | `SexualSelectionAddon` adds a reproduction probability bonus per color computed as: `bonus_c = f(1 - frequency_c)` where `frequency_c = population_c / total_population` and `f` is sampled from a user-selectable distribution `D_par`. The rarer the color, the higher the bonus. Track `enabledReproductionSuccesses_c` as a cumulative counter incremented when a reproduction that would have failed without the bonus succeeds. Displayed as a cumulative bar chart (not over time). |
| **Rationale** | Directly implements the design doc's Level 3 key metric formula and the *"rare colors get a frequency-based advantage independent of strength"* mechanic. The cumulative counter distinguishes Level 3's specific contribution from the baseline Level 2 dynamics. |
| **Decision** | ✅ Accepted |

---

## 3. Engineering Time Estimate (without AI)

| Phase | Task | Estimated Hours |
|---|---|---|
| **Phase 1** | Project scaffold (Vite, React, TS, Tailwind, shadcn/ui, Bun) | 3h |
| **Phase 1** | Tailwind custom palette + base layout (2 rows, 4 panels) | 4h |
| **Phase 1** | Base class skeletons (Simulation, SimulationLevel, Lizard, Player, Stats, Distribution, Addon, UISimulationAdapter) | 6h |
| **Phase 1** | Canvas 2D organism display component with DisplayRenderer interface | 4h |
| **Phase 1** | Vitest setup + Stats service unit tests | 3h |
| **Phase 1 Total** | | **~20h** |
| **Phase 2** | `Stats` sample/probability implementations (normal, exponential) | 4h |
| **Phase 2** | `Level1Simulation` (body size init, death, reproduction logic) | 6h |
| **Phase 2** | `Player` state machine (idle → running → paused → ended) + React hook | 5h |
| **Phase 2** | Level 1 param panel (sliders, distribution selectors, lock-on-start) | 6h |
| **Phase 2** | Population plot + average body size plot (Recharts) | 5h |
| **Phase 2** | Wire organism display to lizard positions | 3h |
| **Phase 2** | Unit tests for Level 1 simulation | 4h |
| **Phase 2 Total** | | **~33h** |
| **Phase 3** | `Level2Simulation` (color weights, trait inheritance, discrete mode) | 8h |
| **Phase 3** | Neighborhood radius query + RPS reproduction mechanics | 8h |
| **Phase 3** | `SexualSelectionAddon` (rare color bonus, cumulative counter) | 5h |
| **Phase 3** | Level 2/3 param panel in accordions | 6h |
| **Phase 3** | Per-color population plots + Level 3 cumulative bar chart | 6h |
| **Phase 3** | Unit tests for Level 2 modelling and addon | 6h |
| **Phase 3 Total** | | **~39h** |
| **Grand Total** | | **~92h** |

> *Estimate assumes a single mid-senior frontend engineer, no AI assistance, familiar with React/TS but not the domain. Does not include QA, deployment, or documentation beyond code comments.*
