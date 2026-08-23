# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `extension/`:

```bash
# Development
npm install
npm run icons        # rasterise icons from the inline SVG (run once after clone)
npm run dev          # watch build (outputs to dist/)
npm run build        # production build (see "Build pipeline" below)

# Quality gates
npm run typecheck    # tsc --noEmit — must be clean
npm run test:unit    # vitest unit tests (tests/unit/**/*.test.ts)
npm run test:e2e     # playwright E2E tests (tests/e2e/**/*.spec.ts)
npm run test         # unit + e2e

# Release
npm run zip          # typecheck + unit tests + build + preflight, then packages
                     # extension/release/deeplens-<version>.zip for CWS

# Utilities
npm run measure      # bundle size report
```

### Build pipeline

`npm run build` is three stages and the order matters:

1. `vite build` — CRXJS builds the **popup** and **service worker**.
2. `vite build --config vite.content.config.ts` — builds the **content script**
   separately as a single self-contained IIFE at `dist/content/deeplens.js`
   (`emptyOutDir: false`, so it must run second).
3. `node scripts/finalize-manifest.mjs` — injects the `content_scripts` entry and
   asserts `web_accessible_resources` is absent.

The content script is deliberately kept out of the CRXJS pipeline: CRXJS ships
ESM content scripts via a loader that `import()`s chunks at runtime, which forces
every chunk into `web_accessible_resources` — stable URLs any page can probe to
detect the extension. `use_dynamic_url: true` does **not** fix this (it rewrites
the loader's origin while the chunk's own static imports still resolve to the
extension origin, so the module graph fails to load — verified in a real Chrome).
A single IIFE removes the loader, the chunks, and the need for any web-accessible
resource at all.

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
- `popup.ts` — settings UI: provider choice, API key entry, default mode (quick/deep), hover delay; persists via `chrome.storage.local`
- Provider host permissions are **optional** and requested here from a user
  gesture via `shared/providerHosts.ts`; the settings view shows a "Grant access"
  banner when the grant was revoked externally

### Shared contracts (`src/shared/`)

- `types.ts` — all cross-context types (`QueryPayload`, `ExtractedContext`, `TokenMessage`, etc.) and message type constants (`MESSAGE.QUERY`, `MESSAGE.ABORT`, `MESSAGE.TOKEN`)
- `storage.ts` — `chrome.storage` helpers safe for content/popup (no secrets)
- `validatePayload.ts` — schema + size + secret-leak checks applied in `messageRouter.ts` before any query proceeds
- `providerHosts.ts` — provider → origin map plus `chrome.permissions` contains/request/prune helpers

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
- **Payload validation**: `validatePayload.ts` checks size limits and scans for accidental secret leakage before the payload reaches the API. The scan covers all four provider key shapes (`sk-ant`, `sk-or-`, `gsk_`, `AIza`), as does `safeLog.ts` redaction.
- **Optional host permissions**: no provider origin is granted at install. The popup requests exactly one, for the selected provider, and releases the others. `messageRouter.ts` checks the grant before fetching and returns `MISSING_HOST_PERMISSION` rather than letting it surface as an opaque CORS failure.
- **No web-accessible resources**: the tooltip CSS is bundled into the content script (`styles/tooltip.css?raw`) rather than fetched from an extension URL. Nothing shipped is reachable from a host page.
- **Closed shadow root**: the tooltip attaches with `mode: 'closed'`, so a host page cannot read what the user looked up. This is why Playwright `pierce/` selectors cannot reach tooltip internals — that coverage lives in `tests/unit/tooltipRender.test.ts`, not E2E.

## Versioning

`extension/package.json` is the single source of truth. `manifest.json` carries
**no** `version` field; `vite.config.ts` injects it at build time, and
`scripts/preflight.mjs` fails packaging if the two ever disagree. Bump with
`npm version` — never hand-edit a version into the manifest.

## Testing

- Unit tests: `vitest`, setup in `tests/setup.ts`, files match `tests/unit/**/*.test.ts`. The default environment is `node`; DOM tests opt in per-file with `@vitest-environment happy-dom`. `css: true` is set so the content script's `?raw` CSS import resolves in tests.
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
