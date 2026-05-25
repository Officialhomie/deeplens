# DeepLens Implementation Plan (0–100 Build Execution Blueprint)

## Title + Metadata
- Project: DeepLens
- Version: 1.0
- Status: Execution Baseline
- Last Updated: May 25, 2026
- Owners:
  - Product: 0xVerse / eth-content-architect
  - Engineering: DeepLens implementation team
  - Design: DeepLens design team

## How to Use This Plan
Purpose of this file:
- This is the canonical execution blueprint for building DeepLens from 0% to 100%.
- Any agent or engineer must follow this order strictly to avoid rework and hidden dependency failures.

Execution rules:
- No implementation starts until Phase 0 is checked complete and signed off.
- Each phase requires both checklists (implementation + validation) to pass before moving to the next phase.
- No feature work is allowed outside the active phase scope.
- If a phase fails validation, status returns to `in progress` and progression is blocked.

## Implementation Tree (Organized)
- 0. Program Setup
- 1. Architecture Foundation
- 2. Core Interaction Engine
- 3. Context + Prompt Intelligence
- 4. Streaming + AI Orchestration
- 5. Tooltip UI System
- 6. Popup Settings + Configuration
- 7. Security + Privacy Hardening
- 8. Performance + Resilience
- 9. Testing + QA Sign-off
- 10. Release Readiness
- 11. Post-v1 Backlog Gate

## Implementation Tree (Organized by Dependency)
1. Phase 0 — Program Setup (0–8%)
2. Phase 1 — Architecture Foundation (8–18%)
3. Phase 2 — Core Interaction Engine (18–30%)
4. Phase 3 — Context + Prompt Intelligence (30–42%)
5. Phase 4 — Streaming + AI Orchestration (42–56%)
6. Phase 5 — Tooltip UI System (56–70%)
7. Phase 6 — Popup Settings + Configuration (70–78%)
8. Phase 7 — Security + Privacy Hardening (78–84%)
9. Phase 8 — Performance + Resilience (84–90%)
10. Phase 9 — Testing + QA Sign-off (90–96%)
11. Phase 10 — Release Readiness (96–100%)
12. Phase 11 — Post-v1 Backlog Gate (follows v1 completion)

## Phase-by-Phase Execution (0–100)

### Phase 0 — Program Setup (0–8%)
Objective:
- Align product, technical, and design requirements into one executable baseline and lock v1 scope.

Scope In:
- Final PRD/TRD/Design brief alignment review.
- v1 scope freeze with P0 and P1 labeling.
- Repository structure and naming contract confirmation.
- Plan activation ceremony (this doc becomes source of truth).

Scope Out:
- Feature/module implementation.
- UI coding and API integration.

Dependencies:
- Existing PRD, TRD, and design brief drafts.

Deliverables:
- Signed scope table (P0/P1/deferred).
- Confirmed folder/module naming map.
- Phase 0 status report at `md/status/phase-0.md`.

#### A) Implementation Checklist
- [ ] All planned modules for this phase exist and are wired
- [ ] Interfaces/contracts match TRD definitions
- [ ] No out-of-scope work added
- [ ] Logs/errors are actionable and non-sensitive
- [ ] Docs for this phase updated

#### B) Validation Checklist
- [ ] Acceptance tests for this phase pass
- [ ] No blocker bugs remain in this phase scope
- [ ] Downstream dependency assumptions verified
- [ ] Security/privacy checks passed for touched areas
- [ ] Phase exit criteria satisfied and signed off

Exit Criteria:
- v1 scope is frozen and approved.
- Module tree + naming contracts are confirmed.
- Phase 0 sign-off recorded.

### Phase 1 — Architecture Foundation (8–18%)
Objective:
- Build the extension foundation and shared contracts required by all downstream phases.

Scope In:
- MV3 extension skeleton.
- TypeScript strict setup.
- Build pipeline (Vite + CRXJS or approved equivalent).
- Shared types, messaging contracts, and storage schema.

Scope Out:
- Detection logic behavior.
- AI streaming and tooltip rendering details.

Dependencies:
- Phase 0 signed off.

Deliverables:
- Manifest baseline.
- Core directories and bootstrap entrypoints.
- Shared contract definitions.
- Phase 1 status report.

#### A) Implementation Checklist
- [x] All planned modules for this phase exist and are wired
- [x] Interfaces/contracts match TRD definitions
- [x] No out-of-scope work added
- [x] Logs/errors are actionable and non-sensitive
- [x] Docs for this phase updated

#### B) Validation Checklist
- [x] Acceptance tests for this phase pass
- [x] No blocker bugs remain in this phase scope
- [x] Downstream dependency assumptions verified
- [x] Security/privacy checks passed for touched areas
- [x] Phase exit criteria satisfied and signed off

Exit Criteria:
- Build succeeds cleanly.
- Messaging and storage contracts compile and are test-verified.

### Phase 2 — Core Interaction Engine (18–30%)
Objective:
- Implement user intent capture reliably without noise.

Scope In:
- Hover detection with configured threshold/debounce.
- Text selection detection.
- Exclusion zones.
- Abort triggers and event lifecycle safety.

Scope Out:
- Prompt generation content quality.
- Streaming renderer UI polish.

Dependencies:
- Phase 1 contracts and runtime skeleton.

Deliverables:
- Detector module implementation.
- Trigger events and cancellation behavior.
- Phase 2 status report.

#### A) Implementation Checklist
- [x] All planned modules for this phase exist and are wired
- [x] Interfaces/contracts match TRD definitions
- [x] No out-of-scope work added
- [x] Logs/errors are actionable and non-sensitive
- [x] Docs for this phase updated

#### B) Validation Checklist
- [x] Acceptance tests for this phase pass
- [x] No blocker bugs remain in this phase scope
- [x] Downstream dependency assumptions verified
- [x] Security/privacy checks passed for touched areas
- [x] Phase exit criteria satisfied and signed off

Exit Criteria:
- Intent detection is accurate on target pages.
- False-trigger rate is acceptable per QA threshold.

### Phase 3 — Context + Prompt Intelligence (30–42%)
Objective:
- Convert trigger context into high-quality mode-aware prompt inputs.

Scope In:
- Context extraction and normalization.
- Prompt builder implementation for Quick, Deep, Links.
- Mode-specific constraints and payload shaping.

Scope Out:
- API transport and SSE lifecycle.

Dependencies:
- Phase 2 trigger payload pipeline.

Deliverables:
- Extractor module.
- Prompt templates + builder.
- Phase 3 status report.

#### A) Implementation Checklist
- [x] All planned modules for this phase exist and are wired
- [x] Interfaces/contracts match TRD definitions
- [x] No out-of-scope work added
- [x] Logs/errors are actionable and non-sensitive
- [x] Docs for this phase updated

#### B) Validation Checklist
- [x] Acceptance tests for this phase pass
- [x] No blocker bugs remain in this phase scope
- [x] Downstream dependency assumptions verified
- [x] Security/privacy checks passed for touched areas
- [x] Phase exit criteria satisfied and signed off

Exit Criteria:
- Context payload quality passes review.
- Prompt outputs match PRD format requirements by mode.

### Phase 4 — Streaming + AI Orchestration (42–56%)
Objective:
- Deliver stable, abort-safe streaming response pipeline.

Scope In:
- Service worker API orchestration.
- SSE token stream parse and forwarding.
- Abort correctness and stale-response prevention.
- Error mapping to client-safe events.

Scope Out:
- Final tooltip visual polish.

Dependencies:
- Phase 3 prompt payloads.

Deliverables:
- API client integration.
- Stream event protocol implementation.
- Phase 4 status report.

#### A) Implementation Checklist
- [x] All planned modules for this phase exist and are wired
- [x] Interfaces/contracts match TRD definitions
- [x] No out-of-scope work added
- [x] Logs/errors are actionable and non-sensitive
- [x] Docs for this phase updated

#### B) Validation Checklist
- [x] Acceptance tests for this phase pass
- [x] No blocker bugs remain in this phase scope
- [x] Downstream dependency assumptions verified
- [x] Security/privacy checks passed for touched areas
- [x] Phase exit criteria satisfied and signed off

Exit Criteria:
- First-token and stream completion behaviors meet performance and correctness gates.
- Abort race conditions resolved.

### Phase 5 — Tooltip UI System (56–70%)
Objective:
- Build adaptive in-page tooltip experience with stateful rendering.

Scope In:
- Shadow DOM tooltip shell.
- Adaptive theming for light/dark contexts.
- Auto-positioning and viewport edge handling.
- Mode toggle and state rendering (loading/streaming/done/error).

Scope Out:
- Popup settings implementation.

Dependencies:
- Phase 4 stream events and request lifecycle.

Deliverables:
- Tooltip engine and style tokens.
- Position engine behavior.
- Phase 5 status report.

#### A) Implementation Checklist
- [x] All planned modules for this phase exist and are wired
- [x] Interfaces/contracts match TRD definitions
- [x] No out-of-scope work added
- [x] Logs/errors are actionable and non-sensitive
- [x] Docs for this phase updated

#### B) Validation Checklist
- [x] Acceptance tests for this phase pass
- [x] No blocker bugs remain in this phase scope
- [x] Downstream dependency assumptions verified
- [x] Security/privacy checks passed for touched areas
- [x] Phase exit criteria satisfied and signed off

Exit Criteria:
- Tooltip is legible, stable, and non-intrusive across target scenarios.
- Positioning and theming pass validation matrix thresholds.

### Phase 6 — Popup Settings + Configuration (70–78%)
Objective:
- Provide controlled user configuration for behavior and keys.

Scope In:
- API key entry and storage flow.
- Default mode selection.
- Hover delay slider.
- Enable/disable toggle.
- Optional blacklist controls if in-scope for v1.

Scope Out:
- Release packaging and store submission tasks.

Dependencies:
- Phase 1 storage schema and shared settings contracts.

Deliverables:
- Popup UI and persistence logic.
- Settings read/write integration with runtime.
- Phase 6 status report.

#### A) Implementation Checklist
- [x] All planned modules for this phase exist and are wired
- [x] Interfaces/contracts match TRD definitions
- [x] No out-of-scope work added
- [x] Logs/errors are actionable and non-sensitive
- [x] Docs for this phase updated

#### B) Validation Checklist
- [x] Acceptance tests for this phase pass
- [x] No blocker bugs remain in this phase scope
- [x] Downstream dependency assumptions verified
- [x] Security/privacy checks passed for touched areas
- [x] Phase exit criteria satisfied and signed off

Exit Criteria:
- Settings persist correctly and runtime behavior updates reliably.

### Phase 7 — Security + Privacy Hardening (78–84%)
Objective:
- Verify and enforce security/privacy requirements before full QA.

Scope In:
- API key isolation guarantees.
- Permission minimization audit.
- Message payload validation and trust boundaries.
- Safe markdown/link rendering checks.

Scope Out:
- Feature expansion.

Dependencies:
- Prior phases completed for end-to-end audit.

Deliverables:
- Security checklist report.
- Privacy compliance notes.
- Phase 7 status report.

#### A) Implementation Checklist
- [x] All planned modules for this phase exist and are wired
- [x] Interfaces/contracts match TRD definitions
- [x] No out-of-scope work added
- [x] Logs/errors are actionable and non-sensitive
- [x] Docs for this phase updated

#### B) Validation Checklist
- [x] Acceptance tests for this phase pass
- [x] No blocker bugs remain in this phase scope
- [x] Downstream dependency assumptions verified
- [x] Security/privacy checks passed for touched areas
- [x] Phase exit criteria satisfied and signed off

Exit Criteria:
- No critical/high security findings remain open.
- Privacy handling is explicitly documented and verified.

### Phase 8 — Performance + Resilience (84–90%)
Objective:
- Tune runtime for responsiveness and reliability under realistic conditions.

Scope In:
- Latency optimization.
- Render smoothness tuning.
- CPU/memory footprint checks.
- Error fallback and retry behavior refinement.

Scope Out:
- New features and product-scope changes.

Dependencies:
- Full end-to-end baseline from phases 1–7.

Deliverables:
- Performance measurement report.
- Resilience behavior checklist.
- Phase 8 status report.

#### A) Implementation Checklist
- [x] All planned modules for this phase exist and are wired
- [x] Interfaces/contracts match TRD definitions
- [x] No out-of-scope work added
- [x] Logs/errors are actionable and non-sensitive
- [x] Docs for this phase updated

#### B) Validation Checklist
- [x] Acceptance tests for this phase pass
- [x] No blocker bugs remain in this phase scope
- [x] Downstream dependency assumptions verified
- [x] Security/privacy checks passed for touched areas
- [x] Phase exit criteria satisfied and signed off

Exit Criteria:
- Performance targets are met or documented with approved exceptions.

### Phase 9 — Testing + QA Sign-off (90–96%)
Objective:
- Validate correctness and regressions before release.

Scope In:
- Unit tests.
- E2E tests.
- Manual cross-site validation matrix.
- Regression and abort race-condition tests.

Scope Out:
- Store publication activities.

Dependencies:
- Stable build from phases 1–8.

Deliverables:
- Test result bundle and QA sign-off.
- Phase 9 status report.

#### A) Implementation Checklist
- [x] All planned modules for this phase exist and are wired
- [x] Interfaces/contracts match TRD definitions
- [x] No out-of-scope work added
- [x] Logs/errors are actionable and non-sensitive
- [x] Docs for this phase updated

#### B) Validation Checklist
- [x] Acceptance tests for this phase pass
- [x] No blocker bugs remain in this phase scope
- [x] Downstream dependency assumptions verified
- [x] Security/privacy checks passed for touched areas
- [x] Phase exit criteria satisfied and signed off

Exit Criteria:
- Test suite pass thresholds achieved.
- QA signs off with no blocker defects.

### Phase 10 — Release Readiness (96–100%)
Objective:
- Package and document DeepLens for release.

Scope In:
- Chrome Web Store metadata.
- Privacy disclosures and policy alignment.
- Packaging and release notes.
- Known limitations and support notes.

Scope Out:
- Post-v1 features.

Dependencies:
- Phase 9 QA sign-off.

Deliverables:
- Release candidate package.
- Submission checklist.
- Phase 10 status report.

#### A) Implementation Checklist
- [ ] All planned modules for this phase exist and are wired
- [ ] Interfaces/contracts match TRD definitions
- [ ] No out-of-scope work added
- [ ] Logs/errors are actionable and non-sensitive
- [ ] Docs for this phase updated

#### B) Validation Checklist
- [ ] Acceptance tests for this phase pass
- [ ] No blocker bugs remain in this phase scope
- [ ] Downstream dependency assumptions verified
- [ ] Security/privacy checks passed for touched areas
- [ ] Phase exit criteria satisfied and signed off

Exit Criteria:
- All release artifacts complete and approved.
- Project reaches 100% plan completion.

### Phase 11 — Post-v1 Backlog Gate
Objective:
- Preserve v1 discipline and route deferred work through controlled backlog intake.

Scope In:
- Capture deferred P1/P2/v2 requests.
- Categorize by impact, effort, and risk.
- Prepare post-release roadmap draft.

Scope Out:
- Direct implementation of deferred requests before v1 release closure.

Dependencies:
- Phase 10 completed.

Deliverables:
- Backlog gate report and roadmap candidates.

#### A) Implementation Checklist
- [ ] All planned modules for this phase exist and are wired
- [ ] Interfaces/contracts match TRD definitions
- [ ] No out-of-scope work added
- [ ] Logs/errors are actionable and non-sensitive
- [ ] Docs for this phase updated

#### B) Validation Checklist
- [ ] Acceptance tests for this phase pass
- [ ] No blocker bugs remain in this phase scope
- [ ] Downstream dependency assumptions verified
- [ ] Security/privacy checks passed for touched areas
- [ ] Phase exit criteria satisfied and signed off

Exit Criteria:
- Deferred scope is documented and triaged for next cycle.

## Global Quality Gates
Security gate:
- API keys remain isolated from page context.
- Permissions are minimum required.
- No sensitive logs.

UX gate:
- Tooltip never blocks critical reading lines.
- Theme adaptation is legible and consistent.
- Interaction model is predictable and low-friction.

Performance gate:
- Time to first token and full-response targets are met.
- CPU and memory stay within approved limits.

Reliability gate:
- Abort and race conditions are handled safely.
- Error states are recoverable and user-actionable.

Documentation gate:
- Phase reports, checklists, and evidence are up to date.
- Any deviations are recorded with owner + rationale.

## Validation Matrix
| Area | Validation Method | Pass Threshold | Evidence Artifact | Sign-off Owner |
|---|---|---|---|---|
| Detection correctness | Unit + manual intent tests across page types | >= 95% correct trigger behavior on test corpus | `md/evidence/detection-correctness.md` | Engineering |
| Extraction quality | Structured payload sampling vs expected context | >= 90% context completeness and accuracy | `md/evidence/extraction-quality.md` | Engineering |
| Stream correctness | SSE integration tests + abort race tests | 0 stale token leaks after abort; >= 99% stream completion stability | `md/evidence/stream-correctness.md` | Engineering |
| Tooltip positioning/theming | Visual QA matrix on light/dark and viewport edges | 0 critical overlap defects in approved matrix | `md/evidence/tooltip-position-theme.md` | Design |
| Settings persistence | Popup-to-runtime persistence tests | 100% settings persistence across restart scenarios | `md/evidence/settings-persistence.md` | Engineering |
| API key secrecy | Security review + runtime inspection | 0 key exposures in page context/logs/messages | `md/evidence/api-key-secrecy.md` | Security |
| Performance targets | Benchmarks on target pages | Meets PRD/TRD latency and footprint targets | `md/evidence/performance-targets.md` | Engineering |
| E2E stability | Playwright suite + manual regression matrix | >= 98% pass rate with 0 blocker defects | `md/evidence/e2e-stability.md` | QA |

## Agent Handoff Protocol
Required update format:
- Phase: `<phase-number and name>`
- Status: `not started | in progress | blocked | validated | done`
- Percent complete within phase: `<0-100>`
- Work completed: `<concise bullets>`
- Validation run: `<tests/checks executed>`
- Risks/blockers: `<concise bullets>`
- Next action: `<single clear next step>`

Required artifact links:
- Phase report: `md/status/phase-X.md`
- Checklist snapshot: `md/checklists/phase-X-checklist.md`
- Evidence files: `md/evidence/<artifact>.md`

Blocker escalation format:
- Blocker ID
- Impacted phase
- Severity (`high`, `medium`, `low`)
- Description
- Evidence
- Proposed mitigation
- Owner + ETA

Definition of done per phase:
- All implementation checklist items complete.
- All validation checklist items complete.
- Exit criteria met.
- Phase artifacts published and reviewed.
- Phase status set to `done` in master tracker.

## Deliverable Naming (Organization Rule)
Stable artifact paths:
- `md/deeplens-implementation-plan.md` (master plan)
- `md/status/phase-0.md` ... `md/status/phase-10.md` (phase reports)
- `md/checklists/` (copied checklist snapshots per phase)
- `md/evidence/` (test output references and sign-off evidence)

Note:
- If `md/status/`, `md/checklists/`, and `md/evidence/` do not exist yet, create them during execution before the first phase artifact is generated.

## Assumptions and Defaults
- This plan governs build order only; feature coding starts after Phase 0 sign-off.
- v1 is Chrome MV3 only.
- Direct API mode is allowed for v1; proxy is controlled follow-up.
- P0 items are mandatory before release.
- P1 items must be explicitly marked included or deferred in phase reports.

## Master Progress Tracker
| Phase | Target % Range | Owner | Status | Date Started | Date Completed | Notes |
|---|---:|---|---|---|---|---|
| Phase 0 — Program Setup | 0–8 | Product + Engineering + Design | done | 2026-05-25 | 2026-05-25 | Scope + contracts locked |
| Phase 1 — Architecture Foundation | 8–18 | Engineering | done | 2026-05-25 | 2026-05-25 | `extension/` scaffold; build + 16 tests pass |
| Phase 2 — Core Interaction Engine | 18–30 | Engineering | done | 2026-05-25 | 2026-05-25 | detector + intent; 20 tests pass |
| Phase 3 — Context + Prompt Intelligence | 30–42 | Engineering | done | 2026-05-25 | 2026-05-25 | extractor + query dispatch; 34 tests |
| Phase 4 — Streaming + AI Orchestration | 42–56 | Engineering | done | 2026-05-25 | 2026-05-25 | SSE + queryId + stream shell; 44 tests |
| Phase 5 — Tooltip UI System | 56–70 | Engineering + Design | done | 2026-05-25 | 2026-05-25 | tooltip engine + CSS tokens; 47 tests |
| Phase 6 — Popup Settings + Configuration | 70–78 | Engineering | done | 2026-05-25 | 2026-05-25 | Full popup + onboarding; session mode; 50 tests |
| Phase 7 — Security + Privacy Hardening | 78–84 | Engineering + Security | done | 2026-05-25 | 2026-05-25 | Trust boundaries, DOMPurify, payload validation; 62 tests |
| Phase 8 — Performance + Resilience | 84–90 | Engineering | done | 2026-05-25 | 2026-05-25 | Settings/response cache, rAF scheduler, retry UX; 69 tests |
| Phase 9 — Testing + QA Sign-off | 90–96 | QA + Engineering | done | 2026-05-25 | 2026-05-25 | 79 unit + 7 E2E pass; Playwright extension suite |
| Phase 10 — Release Readiness | 96–100 | Product + Engineering | not started | - | - | Awaiting kickoff |
| Phase 11 — Post-v1 Backlog Gate | Post-100 | Product | not started | - | - | Starts after v1 release readiness closure |

## Completion Definition for "Plan Up and Running"
- [x] `md/deeplens-implementation-plan.md` exists with full phase breakdown
- [x] All phase sections contain implementation + validation checklists
- [x] Master progress tracker initialized at 0%
- [x] Handoff protocol and evidence rules are present
- [x] Phase 0 marked `in progress`, all other phases `not started`
