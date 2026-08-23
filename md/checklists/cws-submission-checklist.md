# Chrome Web Store Submission Checklist

**Version:** 1.0.0 (injected from `extension/package.json`)
**Updated:** 2026-08-23 — release-hardening pass
**Package:** `extension/release/deeplens-1.0.0.zip`
**Step-by-step runbook (👤 vs 🤖):** `md/release/CWS-SUBMISSION-RUNBOOK.md`

## Build package

- [x] `npm run typecheck` clean (`tsc --noEmit`, zero errors)
- [x] `npm run build` succeeds — two-stage: CRXJS (popup + service worker),
      then a standalone IIFE content script, then `scripts/finalize-manifest.mjs`
- [x] Icons 16 / 48 / 128 generated from SVG via `npm run icons` (`@resvg/resvg-js`)
- [x] `npm run zip` produces the store ZIP with `archiver` — no dependency on a
      system `zip` binary, so it works identically on macOS / Linux / Windows / CI
- [x] `prezip` gates packaging on typecheck + unit tests + build; a broken
      project cannot produce a ZIP

## Versioning

- [x] `package.json` is the **single source of truth**; `manifest.json` carries
      no `version` field and receives it from `vite.config.ts`
- [x] Preflight fails the build if `dist/manifest.json` version ≠ `package.json` version
- [ ] Bump `package.json` version before any resubmission

## Permissions (verified against the built manifest)

- [x] `permissions`: **`storage` only**
- [x] `activeTab` removed — zero references in source
- [x] `scripting` removed — zero references in source
- [x] `tabs` removed — `chrome.tabs.sendMessage` / `chrome.tabs.create` do not
      require it, and `trust.ts` falls back to `sender.url`
- [x] `host_permissions`: **empty** — no provider origin is granted at install
- [x] `optional_host_permissions`: the four provider origins, requested one at a
      time via `chrome.permissions.request()` from a user gesture in the popup
- [x] Switching providers releases the previous origin (`chrome.permissions.remove()`)
- [x] Revoking access externally is recoverable — the settings view shows a
      "Grant access" banner rather than failing silently
- [x] `web_accessible_resources`: **absent**. The content script is a
      self-contained IIFE and the tooltip CSS is bundled into it, so no shipped
      resource is reachable from a host page (removes the install-fingerprinting
      channel). `finalize-manifest.mjs` fails the build if any entry reappears.
- [x] `content_scripts` still matches `<all_urls>` — this is inherent to the
      product (hover on any page) and is justified in the listing copy.
      **Note:** this alone still triggers the broad host-access install warning;
      removing the provider origins narrows the prompt, it does not eliminate it.
- [x] Permission justification present in `md/release/store-listing-cws-paste.md`

## Security

- [x] No `eval`, no remote code; CSP `script-src 'self'; object-src 'self'`
- [x] API key read only in the background service worker (`storageSecure.ts`);
      never crosses a content-script message (`md/evidence/api-key-secrecy.md`)
- [x] Outbound payload secret scan covers **all four** provider key shapes
      (`sk-ant`, `sk-or-`, `gsk_`, `AIza`) — previously Anthropic-only
- [x] Debug-log redaction covers all four provider key shapes
- [x] Gemini key sent as an `x-goog-api-key` header, not a URL query parameter
- [x] Tooltip renders into a **closed** shadow root — host pages cannot read
      what the user looked up

## Listing

- [x] Short description ≤ 132 chars (124) and names all four providers
- [x] Detailed description states what is sent, to whom, and that there is no
      DeepLens server / analytics / telemetry
- [x] Description no longer claims Anthropic-only or lists removed permissions
- [ ] Privacy policy URL entered in CWS dashboard → https://officialhomie.github.io/deeplens/privacy/
- [ ] Short + detailed description pasted from `md/release/store-listing-cws-paste.md`
- [ ] Screenshots generated (`npm run screenshots`) and uploaded (≥1)
- [ ] Category: Productivity
- [ ] Support / contact email set

## QA before submit

- [x] Unit tests — 115 passing across 28 files (`npm run test:unit`)
- [x] E2E — `npm run test:e2e`; see `md/evidence/e2e-stability.md` for the
      headed-Chrome hover-timing caveat
- [x] Packaged ZIP verified loadable as an unpacked extension, popup renders,
      content script boots, install-time grants are `storage` only
- [ ] Manual cross-site matrix (`md/evidence/manual-cross-site-matrix.md`)
- [ ] Manual: provider permission **prompt accepted** → lookup succeeds
- [ ] Manual: provider permission **prompt declined** → provider selection reverts
- [ ] Manual: revoke host access in `chrome://extensions` → tooltip shows
      "needs permission", settings shows Grant access, granting restores service
- [ ] Tested on **Chrome stable** (not only Chromium/Canary)

## Package validation (automated by `scripts/preflight.mjs`)

- [x] manifest version == package.json version
- [x] All three icons present, valid PNGs, correct pixel dimensions
- [x] Declared content script and service worker exist in `dist/`
- [x] No `.map`, `.log`, `.ts`, test files, `node_modules`, `.DS_Store`,
      `__MACOSX`, or editor/VCS artifacts in the package
- [x] ZIP under the 10 MB limit (actual: ~46 KB)
- [x] Permission summary printed at package time for eyeball review

## Post-submit

- [ ] Monitor review feedback
- [ ] Tag git release `v1.0.0` when approved — CI builds and uploads the ZIP
      artifact on `v*` tags
