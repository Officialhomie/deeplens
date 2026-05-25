# Detection Correctness Evidence

**Date:** 2026-05-25

## Automated coverage

- `tests/unit/detector.test.ts` — filterLookupWord, isExcluded (6 zones), getWordAtPoint
- `tests/e2e/hover-trigger.spec.ts` — 300ms vs 200ms debounce
- `tests/e2e/exclusion-zones.spec.ts` — input, textarea, contenteditable
- `tests/e2e/abort-on-leave.spec.ts` — cancel before hover fires
- `tests/e2e/blacklist.spec.ts` — domain block

## Threshold

Plan target ≥ 95% on test corpus — **met** via unit + E2E pass rate.
