# E2E Stability

**Latest run:** 2026-08-23 — release-hardening pass
**Threshold:** ≥ 98% pass, 0 blockers (plan validation matrix)

## Results

| Metric | Value |
|--------|-------|
| Executed tests | 10 |
| Passed | 10 |
| Skipped | 1 (`api-error` — network-dependent) |
| Failed | 0 |
| Flaky | 0 |
| Pass rate (runnable) | **100%** |

## Correction to the earlier Phase 9 record

The Phase 9 entry recorded "8 executed / 7 passed / 0 failed". Re-running the
suite at the start of this pass produced **7 passed, 2 failed, 1 flaky**. The
earlier record was not reproducible; the two failures were structural, not
environmental, and had never been able to pass:

**`hover-trigger` "tooltip shows word label and mode buttons"** and
**`select-trigger` "selection tooltip shows visible content"** asserted against
`pierce/.dl-tooltip`. The tooltip renders into a shadow root attached with
`mode: 'closed'`, and Playwright's `pierce` engine traverses **open** roots only,
so those locators could never resolve. Confirmed directly: `host.shadowRoot`
evaluates to `null` from the page.

The closed root is a deliberate privacy property — a host page must not be able
to read what the user looked up — so it was kept, and the assertions were moved
rather than the root opened. Both tests now assert the observable contract (host
attaches, is rendered, and is *not* readable from the page). The markup and
control coverage they were meant to provide now lives in
`tests/unit/tooltipRender.test.ts` (7 tests).

## Bug found by the suite during this pass

`exclusion-zones` began failing deterministically after the content script was
rebundled as a single IIFE. This was a genuine product bug that faster boot
unmasked, not a regression:

- `onMouseOver` checked `isExcluded(e.target)`; **`onMouseMove` did not**.
- `mouseover` fires once on entry, `mousemove` keeps firing inside the element,
  so moving the pointer within a `contenteditable` region started a hover timer
  and opened the tooltip over the user's own text — a rich-text editor, comment
  box or compose window.
- Inputs and textareas escaped it only incidentally: `caretRangeFromPoint` finds
  no word inside a form control, so no lookup was produced.

Fixed in `src/content/detector.ts` by applying the same exclusion guard in
`onMouseMove`. Locked in by `tests/unit/exclusionZones.test.ts` (4 tests) so it
cannot silently regress if E2E timing shifts again.

## Skipped test rationale

`api-error.spec.ts` — requires a live provider HTTP response. Error UX is
validated in `tests/unit/errorDisplay.test.ts` (recovery matrix covering every
error code, including `MISSING_HOST_PERMISSION`) and by manual popup key testing.

## Known environmental caveat

MV3 extensions cannot load in headless Chrome, so the suite runs headed
(`headless: false`) with `workers: 1` and `retries: 2`. Hover-driven tests
depend on real pointer events and can flake if the browser window loses focus
during the run. In CI the suite runs under `xvfb-run`, which gives it a stable
virtual display and avoids the focus-stealing problem entirely.
