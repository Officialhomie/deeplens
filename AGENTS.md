# DeepLens — Agent Execution Guide

## Source of truth

Build order is defined in **`md/deeplens-implementation-plan.md`**. Do not start feature implementation until **Phase 0** is signed off.

## Current phase

| Phase | Status | Report |
|-------|--------|--------|
| 0 — Program Setup | Done | `md/status/phase-0.md` |
| 1 — Architecture Foundation | Done | `md/status/phase-1.md` |
| 2 — Core Interaction Engine | Done | `md/status/phase-2.md` |
| 3 — Context + Prompt Intelligence | Done | `md/status/phase-3.md` |
| **4 — Streaming + AI Orchestration** | Done | `md/status/phase-4.md` |
| **5 — Tooltip UI System** | Done | `md/status/phase-5.md` |
| **6 — Popup Settings + Configuration** | Done | `md/status/phase-6.md` |
| **7 — Security + Privacy Hardening** | Done | `md/status/phase-7.md` |
| **8 — Performance + Resilience** | Not started | — |

## Required reads before coding

1. `md/scope/v1-scope-freeze.md` — what ships in v1.0
2. `md/contracts/module-naming-map.md` — where files live (`extension/` package)
3. `md/deeplens-trd.md` — module contracts and APIs

## Handoff format

When completing work, update the active `md/status/phase-X.md` using the protocol in the implementation plan § Agent Handoff Protocol.

## Scope rules

- **P0** = mandatory for v1.0 release
- **P1** = must be explicitly **Ship** or **Defer** in scope freeze (do not assume)
- No work outside the active phase in the master tracker
