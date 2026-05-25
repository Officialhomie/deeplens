# Performance Measurement — v1.0

**Date:** 2026-05-25  
**Command:** `cd extension && npm run build && npm run measure`  
**TRD reference:** §9.1, §9.2, §9.3

## Bundle sizes (gzipped)

| Asset | Measured | TRD target | Status |
|-------|----------|------------|--------|
| Content (`index.ts` bundle) | 15.84 KB | < 40 KB | Pass |
| Background service worker | 3.45 KB | < 20 KB | Pass |
| Popup JS | 1.51 KB | < 15 KB | Pass |
| `tooltip.css` | 1.48 KB | < 5 KB | Pass |
| Tracked JS/CSS total | ~24.3 KB | < 500 KB ext | Pass |

DOMPurify included in content bundle; still within content budget.

## Runtime optimizations (Phase 8)

| Optimization | Implementation |
|--------------|----------------|
| Hot-path settings read | `settingsCache.ts` — no async storage per `mouseover` |
| Passive listeners | `detector.ts` capture + `passive: true` |
| Stream paint batching | `renderScheduler.ts` — one DOM update per animation frame |
| Duplicate query skip | `responseCache.ts` — 1s TTL single-entry cache |

## Runtime budgets (not automated in CI)

| Metric | Target | Notes |
|--------|--------|-------|
| First tooltip render | < 50ms | Cached hits skip network entirely |
| First AI token p95 | < 800ms | Manual Chrome profiling pre-release |
| Idle CPU | < 0.5% | Validated via passive listeners + cache |
| Stream idle timeout | 45s | `STREAM_IDLE_TIMEOUT_MS` watchdog |

Approved exceptions: none required for bundle sizes.
