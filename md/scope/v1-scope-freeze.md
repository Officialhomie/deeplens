# DeepLens v1.0 — Scope Freeze

**Version:** 1.0  
**Status:** Frozen (pending formal sign-off)  
**Date:** 2026-05-25  
**Canonical plan:** `md/deeplens-implementation-plan.md`

## Release definition

**v1.0** = Chrome MV3 extension, BYOK (user Anthropic API key), Quick + Deep modes, streaming tooltip, settings popup, Chrome Web Store–ready build.

**Out of v1.0:** Firefox/Safari, mobile, hosted proxy billing, Links mode, note saving, domain blacklist UI, full options page, analytics, i18n output.

---

## Feature scope table

| ID | Feature | PRD priority | v1.0 decision | Phase | Notes |
|----|---------|--------------|---------------|-------|-------|
| F-01 | Hover detection | P0 | **Ship** | 2 | Default 300ms |
| F-02 | Selection detection | P0 | **Ship** | 2 | |
| F-03 | Context extraction | P0 | **Ship** | 3 | |
| F-04 | Abort on leave | P0 | **Ship** | 2 | Before first token |
| F-05 | Debounce | P0 | **Ship** | 2 | |
| F-06 | Exclusion zones | P1 | **Ship** | 2 | Inputs, textareas, code editors |
| F-07 | Domain blacklist | P1 | **Defer v1.5** | 6+ | Settings UI per design §13 |
| F-08 | Quick mode | P0 | **Ship** | 3–4 | |
| F-09 | Deep mode | P0 | **Ship** | 3–4 | |
| F-10 | Links mode | P1 | **Defer v1.5** | — | Prompts in TRD for future |
| F-11 | Streaming output | P0 | **Ship** | 4–5 | |
| F-12 | Context-aware prompting | P0 | **Ship** | 3 | |
| F-13 | Mode memory | P1 | **Ship** | 6 | Session memory only |
| F-14 | Floating tooltip | P0 | **Ship** | 5 | |
| F-15 | Auto-position | P0 | **Ship** | 5 | |
| F-16 | Dismiss Escape | P0 | **Ship** | 5 | |
| F-17 | Click-away dismiss | P0 | **Ship** | 5 | |
| F-18 | Pin / expand | P1 | **Ship** | 5 | No persist/save until v1.5 |
| F-19 | Copy to clipboard | P1 | **Defer v1.0.1** | 5+ | Low risk add-on post-launch |
| F-20 | Mode toggle in UI | P1 | **Ship** | 5 | Quick/Deep only in v1.0 |
| F-21 | Keyboard shortcut | P1 | **Defer v1.5** | 6+ | |
| F-22 | Dark mode support | P0 | **Ship** | 5 | Adaptive tooltip |
| F-23 | Extension popup | P0 | **Ship** | 6 | |
| F-24 | API key storage | P0 | **Ship** | 1, 7 | `chrome.storage.local` |
| F-25 | Default mode selector | P1 | **Ship** | 6 | Quick/Deep |
| F-26 | Hover delay config | P1 | **Ship** | 6 | 200–800ms |
| F-27 | Language output | P2 | **Defer v2+** | — | English-only v1.0 |

---

## Non-feature scope (v1.0)

| Item | Decision |
|------|----------|
| Browser | Chrome MV3 only |
| API path | Direct Anthropic from service worker (BYOK) |
| Proxy / hosted API | Deferred v1.1+ (TRD §13) |
| Testing | Vitest unit + Playwright E2E per TRD §11 |
| Build | Vite + CRXJS per TRD §12 |

---

## Deferred backlog (post–v1.0)

| Bucket | Items |
|--------|-------|
| **v1.0.1** | F-19 Copy to clipboard |
| **v1.5** | F-07 blacklist, F-10 Links, F-21 shortcuts, note saving, hosted API, onboarding polish |
| **v2.0** | Firefox/Safari, mobile, domain models, team features, F-27 i18n |

---

## Open questions (tracked, not blocking scaffold)

1. Hover default vs select-only A/B — default remains hover-on; monitor false-trigger rate in Phase 9.
2. Model picker in settings — **deferred**; fixed `claude-sonnet-4-20250514` for v1.0.
3. Links web_search vs post-process — decided by deferring Links to v1.5.
4. i18n — English-only v1.0.
5. Shadow DOM vs iframe CSP fallback — Shadow DOM v1.0; revisit if evidence in Phase 9.

---

## Sign-off

| Approver | Status | Date |
|----------|--------|------|
| Product (0xVerse) | **Pending** | — |
| Engineering | **Proposed** | 2026-05-25 |
| Design | **Pending** | — |

When all three are **Approved**, update `md/status/phase-0.md` status to `validated` and implementation plan master tracker to `done`.
