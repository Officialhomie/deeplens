# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `extension/`:

```bash
# Development
npm install
npm run icons        # generate icons from SVG source (run once after clone)
npm run dev          # watch build (outputs to dist/)
npm run build        # production build

# Testing
npm run test:unit    # vitest unit tests (tests/unit/**/*.test.ts)
npm run test:e2e     # playwright E2E tests (tests/e2e/**/*.spec.ts)
npm run test         # unit + e2e

# Release
npm run zip          # builds then packages extension/release/deeplens-1.0.0.zip for CWS

# Utilities
npm run measure      # bundle size report
```

To run a single unit test file:
```bash
cd extension && npx vitest run tests/unit/claudeAPI.test.ts
```

To load in Chrome: build first, then **chrome://extensions → Load unpacked → `extension/dist`**.

## Architecture

DeepLens is a Chrome MV3 extension. All application code lives under `extension/`; `md/` contains docs only and has no runtime code.

### Three execution contexts

**Content script** (`src/content/`) — injected into every page at `document_idle`:
- `index.ts` boots the pipeline: `initSettingsCache` → `initIntentEngine` → `initQueryCoordinator` → `initStreamer` → `initTooltip`
- `intent.ts` / `detector.ts` — detect hover/select events and emit intent signals
- `extractor.ts` — builds `ExtractedContext` from DOM (selected text, surrounding sentence/paragraph, heading, page metadata)
- `queryCoordinator.ts` — debounce, abort orchestration, sends `DEEPLENS_QUERY` to background
- `tooltip.ts` — full tooltip UI lifecycle (show, pin, dismiss, error states, mode toggle); renders into Shadow DOM
- `streamer.ts` — receives `DEEPLENS_TOKEN` messages and feeds tokens to `streamRenderer.ts`
- `shadowDOM.ts` — attaches a `position:fixed` shadow host at `z-index:2147483647`; isolates styles

**Background service worker** (`src/background/`):
- `service-worker.ts` — entry; calls `registerMessageRouter()`
- `messageRouter.ts` — validates sender trust, validates payload, dispatches `handleQuery`/abort, replies via `DEEPLENS_TOKEN`
- `claudeAPI.ts` — streams Anthropic SSE (`claude-sonnet-4-20250514`, fixed for v1.0); model: `CLAUDE_MODEL`, URL: `ANTHROPIC_API_URL`
- `storageSecure.ts` — only module that reads the API key; never imported by content or popup
- `rateLimiter.ts` — per-session request budget
- `trust.ts` — validates `chrome.runtime.id` and sender tab URL before processing any message

**Popup** (`src/popup/`):
- `popup.ts` — settings UI: API key entry, default mode (quick/deep), hover delay; persists via `chrome.storage.local`

### Shared contracts (`src/shared/`)

- `types.ts` — all cross-context types (`QueryPayload`, `ExtractedContext`, `TokenMessage`, etc.) and message type constants (`MESSAGE.QUERY`, `MESSAGE.ABORT`, `MESSAGE.TOKEN`)
- `storage.ts` — `chrome.storage` helpers safe for content/popup (no secrets)
- `validatePayload.ts` — schema + size + secret-leak checks applied in `messageRouter.ts` before any query proceeds

### Message flow

```
Content                     Background
  |-- DEEPLENS_QUERY -------->|
  |                           |-- fetch Anthropic SSE
  |<-- DEEPLENS_TOKEN (n) ----|   (streaming tokens)
  |<-- DEEPLENS_TOKEN (done) -|
  |-- DEEPLENS_ABORT -------->|
```

### Module boundaries (enforced by TRD)

- `storageSecure.ts` — background only; never imported by content or popup
- `claudeAPI.ts` / `prompts.ts` — background only; never touch DOM
- `extractor.ts` — content only; never builds prompt strings
- `sanitize.ts` — DOMPurify wrapper; called before any `innerHTML` assignment
- `shared/` modules — importable everywhere except `storageSecure.ts`

See [md/contracts/module-naming-map.md](md/contracts/module-naming-map.md) for the full ownership table.

## Key design decisions

- **BYOK**: API key stored in `chrome.storage.local`, read only in the background service worker via `storageSecure.ts`. The key never passes through content script messages.
- **Shadow DOM isolation**: Tooltip attaches to a `position:fixed` shadow host to avoid host-page CSS conflicts. CSS is injected via `<link>` with an inline `<style>` fallback for strict-CSP pages.
- **SSE streaming**: Background fetches Anthropic's streaming API and relays tokens via `chrome.tabs.sendMessage` — the only path from background to content.
- **Abort safety**: Every query carries a `queryId`; `streamSession.ts` tracks active `(tabId, queryId)` pairs so stale tokens from aborted requests are silently dropped.
- **Payload validation**: `validatePayload.ts` checks size limits and scans for accidental secret leakage before the payload reaches the API.

## Testing

- Unit tests: `vitest` with `happy-dom`, setup in `tests/setup.ts`, files match `tests/unit/**/*.test.ts`
- E2E tests: Playwright (single worker, no parallelism), test fixtures served at `http://127.0.0.1:4173` from `tests/e2e/fixtures/`; extension loaded via `tests/e2e/global-setup.ts`
- E2E tests require a built extension in `dist/` — run `npm run build` before `npm run test:e2e`

## GitHub Pages (hosted privacy policy)

- Source: `docs/privacy/index.html`; markdown source: `md/privacy/privacy-policy.md`
- **Auto-deploys only from `main`** — changes on `dev` do not update the public site until merged to `main`
- After merging to `main`, verify HTTP 200 at the privacy URL before updating CWS listing

## v1.0 scope

Ships: Quick + Deep modes, hover + select triggers, streaming tooltip, Shadow DOM, settings popup, BYOK, Chrome MV3 only.

Deferred: Links mode, domain blacklist UI, copy-to-clipboard (v1.0.1), Firefox/Safari, keyboard shortcuts, i18n.

See [md/scope/v1-scope-freeze.md](md/scope/v1-scope-freeze.md) for the full feature table.
