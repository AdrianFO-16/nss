# Natural Selection Simulator

An interactive educational web app that simulates natural selection using the side-blotched lizard (*Uta stansburiana*) as a model organism.

## Overview

The simulator runs discrete-generation population models with configurable parameters. Each level introduces a new selection mechanism:

| Level | Mechanism |
|---|---|
| 1 | **Directional selection** — body size under selection pressure; larger lizards reproduce more |
| 2 | **RPS dynamics** — orange / blue / yellow color morphs in a Rock-Paper-Scissors cycle |
| 3 | **Sexual selection** — rare-color advantage bonus layered on top of Level 2 |

## Features

- Seedable PRNG for fully reproducible runs
- Preset system with per-level parameter sets
- KDE plot comparing initial vs. current body-size distribution (Level 1)
- Per-color population plots and sexual-selection success tracking (Level 2/3)
- Drag-resizable panel layout
- Export current parameters as JSON

## Stack

- **Runtime** — Bun
- **UI** — React + Vite + TypeScript
- **Styling** — Tailwind CSS v4 + shadcn/ui
- **Charts** — Recharts
- **Tests** — Vitest (47 unit tests)

## Getting started

```bash
cd packages/node
bun install
bun run dev
```

Tests:

```bash
cd packages/node && bun run test
```

## Project structure

```
packages/node/src/
  simulation/       Core engine — Player, SimulationLevel, Stats, Rng, Addons
  ui/               React components, hooks, adapters, presets
docs/artifacts/mvp/ Design doc, phase plans, review proposals
```
