# Agent Rules

## Project Context

Natural Selection Simulator — interactive educational web app built as a Vite React TypeScript application simulating natural selection using the side-blotched lizard (*Uta stansburiana*) as a model organism.

---

## Rules

### Code Location

- App implementation must be rooted in `packages/node/` directory
- Do not place any application source code, configs, or package files outside of `packages/node/`

### Documentation & Artifacts

- All documentation and intermediate plans/artifacts for code creation go in `docs/artifacts/`
- When referencing `docs/artifacts/`, always explicitly clarify which subdirectory you will read from and write to — never assume the current one
- Never mix artifacts from different development phases or iterations into the same subdirectory
- Current MVP development artifacts directory: `docs/artifacts/mvp/`

### Source of Truth

- `docs/artifacts/mvp/design-doc.md` is the canonical design document — **do not modify it**
- `docs/artifacts/mvp/review-proposals.md` contains resolved architectural and modelling decisions — consult it before implementing any service or simulation logic
- Each phase plan (`phase-1-plan.md`, `phase-2-plan.md`, `phase-3-plan.md`) in `docs/artifacts/mvp/` is the implementation guide for that phase — read it before writing any code for that phase

### Branching Strategy

- Parent feature branch: `mvp`
- Phase branches:
  - Phase 1 → `phase-1`
  - Phase 2 → `phase-2`
  - Phase 3 → `phase-3`
- Each phase branch merges into `mvp` when complete
- Commits within each branch must follow the commit breakdown defined in the corresponding phase plan

### General Workflow

1. Read the relevant phase plan before starting implementation
2. Verify all architectural proposals in `review-proposals.md` that affect the current phase are in **Decision: Accepted** state
3. Build only what is in scope for the current phase — do not pre-implement future phase logic
4. Write unit tests for all services as defined in the plans
5. Update `docs/artifacts/mvp/` artifacts if scope changes are agreed upon — never update silently
