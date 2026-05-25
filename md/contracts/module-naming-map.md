# DeepLens — Module & Naming Contract

**Version:** 1.0  
**Status:** Confirmed (Phase 0)  
**Date:** 2026-05-25  
**Authority:** TRD §12.3 supersedes PRD §6.1 flat layout.

## Repository root

```
DEEPLENS/                          # Git root (workspace name)
├── md/                            # Product + execution docs (no runtime code)
│   ├── deeplens-prd.md
│   ├── deeplens-trd.md
│   ├── deeplens-design-brief.md
│   ├── deeplens-implementation-plan.md
│   ├── scope/
│   ├── contracts/                 # This file
│   ├── status/                    # phase-0.md … phase-10.md
│   ├── checklists/
│   └── evidence/
├── deeplens-app-flow.html
├── README.md
└── extension/                     # Phase 1+ Chrome extension package (canonical app root)
```

> **Naming rule:** Application source lives under `extension/`, not repo root, to keep docs and shipped code separated.

## Extension package tree (Phase 1 scaffold target)

```
extension/
├── manifest.json                  # MV3 — generated or hand-maintained per CRXJS
├── vite.config.ts
├── tsconfig.json
├── package.json
├── src/
│   ├── content/
│   │   ├── index.ts               # Boots detector, tooltip, streamer
│   │   ├── detector.ts            # F-01, F-02, F-04, F-05, F-06
│   │   ├── extractor.ts           # F-03 context DOM extraction
│   │   ├── tooltip.ts             # Tooltip engine (orchestrates shadow + position)
│   │   ├── streamer.ts            # SSE token → DOM renderer
│   │   ├── sanitize.ts            # DOMPurify before innerHTML (Phase 7)
│   │   └── shadowDOM.ts           # Shadow root attach + style injection
│   ├── background/
│   │   ├── service-worker.ts      # Entry; message router
│   │   ├── messageRouter.ts       # DEEPLENS_QUERY / ABORT / TOKEN routing
│   │   ├── claudeAPI.ts           # Anthropic SSE fetch + AbortController
│   │   ├── storageSecure.ts       # API key read (background only)
│   │   ├── trust.ts               # Message sender validation
│   │   └── prompts.ts             # SYSTEM_PROMPTS + buildUserMessage
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.ts
│   │   └── popup.css
│   └── shared/                    # Cross-context types + constants (importable everywhere)
│       ├── types.ts               # QueryPayload, ExtractedContext, QueryMode, messages
│       ├── storage.ts               # chrome.storage helpers (no secrets in content)
│       ├── position.ts            # Viewport tooltip positioning
│       ├── validatePayload.ts     # Query payload schema + limits (Phase 7)
│       ├── safeLog.ts             # Dev log secret redaction (Phase 7)
│       └── debounce.ts
├── styles/
│   └── tooltip.css                # Injected into shadow root
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── tests/
│   ├── unit/
│   └── e2e/
└── scripts/
    └── zip.js                     # CWS submission bundle
```

### TRD → repo mapping adjustments

| TRD path | Contract path | Rationale |
|----------|---------------|-----------|
| `src/utils/types.ts` | `src/shared/types.ts` | Clearer: shared contracts, not generic utils |
| `src/utils/storage.ts` | `src/shared/storage.ts` | Same |
| (implicit) `messageRouter` | `src/background/messageRouter.ts` | Explicit file per TRD diagram |

## File naming rules

| Rule | Example |
|------|---------|
| TypeScript modules | `camelCase.ts` |
| React N/A in v1 | — |
| Tests mirror source | `detector.test.ts` next to or under `tests/unit/` |
| No default export for shared types | Named exports from `shared/types.ts` |
| Message type constants | `DEEPLENS_QUERY`, `DEEPLENS_TOKEN`, `DEEPLENS_ABORT` (SCREAMING_SNAKE) |

## Message contract names (TRD §2.2)

```typescript
// Content → Background
type: 'DEEPLENS_QUERY' | 'DEEPLENS_ABORT'

// Background → Content
type: 'DEEPLENS_TOKEN'  // payload: { token, done, error? }
```

## Module responsibility boundaries

| Module | Context | Owns | Must not |
|--------|---------|------|----------|
| `detector.ts` | Content | Hover/select/debounce/abort signals | API calls, storage secrets |
| `extractor.ts` | Content | DOM context → `ExtractedContext` | Prompt strings |
| `tooltip.ts` | Content | UI lifecycle, pin, dismiss | Fetch to Anthropic |
| `streamer.ts` | Content | Token append to tooltip DOM | Storage reads |
| `shadowDOM.ts` | Content | Attach shadow, inject CSS | Business logic |
| `service-worker.ts` | Background | SW lifecycle registration | DOM |
| `messageRouter.ts` | Background | Route messages, validate payloads, tab replies | Prompt content |
| `storageSecure.ts` | Background | Read API key | Content/popup export to page |
| `trust.ts` | Background | Sender id + tab URL checks | DOM |
| `validatePayload.ts` | Shared | Schema/size/secret checks | Network |
| `sanitize.ts` | Content | DOMPurify HTML | API calls |
| `claudeAPI.ts` | Background | SSE stream, abort map | DOM |
| `prompts.ts` | Background | System prompts + user message build | DOM |
| `popup.ts` | Popup | Settings UI persistence | Content script APIs |

## Phase ownership map

| Module prefix | First phase |
|---------------|-------------|
| `extension/` scaffold, `shared/types`, manifest | **1** |
| `detector`, `extractor` | **2–3** |
| `prompts`, `claudeAPI`, `messageRouter` | **3–4** |
| `tooltip`, `streamer`, `shadowDOM`, `styles/` | **5** |
| `popup/` | **6** |
| `validatePayload`, `safeLog`, `sanitize`, `trust`, `storageSecure` | **7** |
| `settingsCache`, `responseCache`, `renderScheduler`, `retryAfter` | **8** |
| `tests/e2e/*.spec.ts`, Playwright harness | **9** |

## Document artifact naming (execution)

| Artifact | Path pattern |
|----------|----------------|
| Phase status | `md/status/phase-{N}.md` |
| Phase checklist | `md/checklists/phase-{N}-checklist.md` |
| Evidence | `md/evidence/{topic}.md` |

---

**Confirmed by:** Engineering (2026-05-25). Product/Design acknowledgment via Phase 0 sign-off.
