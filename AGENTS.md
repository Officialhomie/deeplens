# DeepLens — Agent Execution Guide

## Source of truth

Build order is defined in **`md/deeplens-implementation-plan.md`**. Phases **0–10** are complete for v1.0 release candidate.

## Current phase

| Phase | Status | Report |
|-------|--------|--------|
| 0–9 | Done | `md/status/phase-0.md` … `md/status/phase-9.md` |
| **10 — Release Readiness** | Done | `md/status/phase-10.md` |
| **11 — Post-v1 Backlog Gate** | Optional | Process gate after CWS submit |

## Release (v1.0.0)

```bash
cd extension
npm run zip          # → release/deeplens-1.0.0.zip
```

| Artifact | Path |
|----------|------|
| Store listing copy | `md/release/store-listing.md` |
| Privacy policy | `md/privacy/privacy-policy.md` |
| CWS checklist | `md/checklists/cws-submission-checklist.md` |
| Release notes | `md/release/RELEASE_NOTES-v1.0.0.md` |

## Required reads before coding

1. `md/scope/v1-scope-freeze.md` — what ships in v1.0
2. `md/contracts/module-naming-map.md` — where files live (`extension/` package)
3. `md/deeplens-trd.md` — module contracts and APIs

## Handoff format

When completing work, update the active `md/status/phase-X.md` using the protocol in the implementation plan § Agent Handoff Protocol.

## Scope rules

- **P0** = mandatory for v1.0 release
- **P1** = must be explicitly **Ship** or **Defer** in scope freeze (do not assume)
