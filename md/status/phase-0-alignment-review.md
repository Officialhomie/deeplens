# Phase 0 — PRD / TRD / Design Alignment Review

**Date:** 2026-05-25  
**Reviewer:** DeepLens implementation team (agent-assisted)  
**Inputs:** `md/deeplens-prd.md`, `md/deeplens-trd.md`, `md/deeplens-design-brief.md`, `deeplens-app-flow.html`

## Summary

| Area | Status | Notes |
|------|--------|-------|
| Core product intent | **Aligned** | All three docs describe hover/select → context → streamed tooltip without navigation |
| v1 surfaces | **Aligned** | Tooltip + popup only; no options page or dashboard |
| Tech stack | **Aligned** | MV3, TypeScript strict, Vite + CRXJS, Shadow DOM, service worker API proxy |
| Security model | **Aligned** | API key in service worker / `chrome.storage.local` only |
| Repo layout | **Resolved** | PRD §6.1 flat tree superseded by TRD §12.3 `src/` layout (canonical) |
| v1 mode scope | **Resolved** | Links mode deferred to v1.5 per PRD roadmap; Quick + Deep ship in v1.0 |
| Prompt location | **Clarified** | TRD places finalized prompts in `src/background/prompts.ts`; content builds user message via extractor |

## Cross-document agreement (locked)

1. **Trigger model:** Hover ≥300ms (configurable 200–800ms in settings) + text selection; abort on leave before first token.
2. **Modes in v1.0 release:** Quick + Deep only (streaming). Links mode UI/prompts exist in TRD/design for forward compatibility but are **out of v1.0 release scope**.
3. **Tooltip:** Shadow DOM, adaptive light/dark, viewport-aware position, Escape + click-away dismiss.
4. **Popup:** API key, global on/off, default mode, hover delay; first-run onboarding (3 steps).
5. **No server persistence in v1.0:** Stateless queries; optional Vercel proxy spec is v1.1+ only.
6. **Performance targets:** PRD §6.4 matches TRD §9 (TTFT &lt;800ms p95, etc.).

## Discrepancies found and resolution

| ID | Source A | Source B | Resolution |
|----|----------|----------|------------|
| D-01 | PRD §6.1 `deeplens/` flat dirs (`content/detector.js`) | TRD §12.3 `src/` + `.ts` | **TRD wins.** Phase 1 scaffold uses TRD tree. PRD §6.1 annotated as illustrative legacy in scope doc. |
| D-02 | PRD F-10 Links = P1 | PRD §12 roadmap v1.0 = Quick + Deep only | **v1.0 release excludes Links.** Mode toggle shows Quick/Deep only until v1.5. |
| D-03 | Design QA checklist includes Links mode | Roadmap defers Links | Links QA moves to **v1.5 validation matrix**; v1.0 QA covers Quick + Deep only. |
| D-04 | TRD diagram `promptBuilder` in content path | TRD §4.7 `background/prompts.ts` | User message built in content/background boundary via `QueryPayload`; system prompts live in **background** only. |
| D-05 | PRD F-18 Pin = P1 | Design S4 Pin screen in v1.0 map | **Pin UI included v1.0** (expand/dock). Note *saving* deferred v1.5 per design §13. |
| D-06 | PRD open Q: Shadow DOM vs iframe | TRD mandates Shadow DOM | **Shadow DOM** for v1.0; iframe fallback logged as post-v1 risk if CSP blocks emerge. |

## Open questions (non-blocking for Phase 0 exit)

Tracked in `md/scope/v1-scope-freeze.md` §Open Questions. None block Phase 1 architecture start once scope is signed.

## Alignment sign-off

| Role | Name | Status | Date |
|------|------|--------|------|
| Product | 0xVerse / eth-content-architect | **Pending** | — |
| Engineering | DeepLens implementation team | **Ready** | 2026-05-25 |
| Design | DeepLens design team | **Pending** | — |

**Gate:** Phase 0 exit requires Product + Design approval on scope freeze (`md/scope/v1-scope-freeze.md`).
