# Permission Audit — v1.0

**Date:** 2026-08-23 (supersedes the 2026-05-25 audit)
**Manifest source:** `extension/manifest.json` (+ version injected by `vite.config.ts`)
**Verified against:** the built `dist/manifest.json` and the shipping ZIP

## Declared permissions

| Permission | Purpose | Minimization |
|------------|---------|--------------|
| `storage` | API key + settings in `chrome.storage.local` | Required; local only, no `storage.sync` |

That is the complete install-time permission set.

## Removed since the previous audit

| Permission | Why removed | Evidence |
|------------|-------------|----------|
| `activeTab` | Zero references anywhere in `src/` | `grep -rn "activeTab" src/` → no hits |
| `scripting` | Zero references; `chrome.scripting.*` never called | `grep -rn "chrome.scripting" src/` → no hits |
| `tabs` | `chrome.tabs.sendMessage` and `chrome.tabs.create` do not require it. It only gates sensitive tab fields, and `trust.ts` already falls back to `sender.url`, which is always populated for the extension's own content scripts. | Verified by loading the packaged ZIP: message relay and the settings tab both work with `permissions: ["storage"]` |

## Host permissions

`host_permissions` is **absent**. No provider origin is granted at install time.

| Optional origin | Requested when |
|-----------------|----------------|
| `https://api.anthropic.com/*` | User selects Anthropic |
| `https://generativelanguage.googleapis.com/*` | User selects Google Gemini |
| `https://api.groq.com/*` | User selects Groq |
| `https://openrouter.ai/*` | User selects OpenRouter |

Implemented in `src/shared/providerHosts.ts`:

- `hasProviderPermission()` → `chrome.permissions.contains`
- `requestProviderPermission()` → `chrome.permissions.request`, called only from a
  user gesture in the popup (a `change` on the provider select, the Activate
  click, or the Grant access button)
- `pruneProviderPermissions()` → `chrome.permissions.remove` for every origin
  except the one in use, so exactly one provider origin is ever held

`messageRouter.ts` checks the grant before any provider fetch and relays
`MISSING_HOST_PERMISSION` if it is absent, rather than letting a revoked grant
surface as an opaque CORS/network error.

**Verified on the packaged artifact:** immediately after install,
`chrome.permissions.getAll()` returns `permissions: ["storage"]`, and
`chrome.permissions.contains({origins:["https://api.anthropic.com/*"]})`
returns `false`.

## Web-accessible resources

**None declared.** The content script ships as a single self-contained IIFE and
the tooltip CSS is bundled into it, so no shipped file is reachable from a host
page — removing the install-fingerprinting channel that stable extension
resource URLs provide. `scripts/finalize-manifest.mjs` fails the build if any
`web_accessible_resources` entry reappears.

## Content scripts

| Match | Notes |
|-------|-------|
| `<all_urls>` | Required for on-page hover/select triggers. This is a content-script match pattern, not a host permission, but it is what produces the broad host-access install warning — removing the provider origins narrows that prompt, it does not eliminate it. Justified in the store listing. |

The content script never receives the API key. The tooltip renders into a
**closed** shadow root, so the host page cannot read what the user looked up.

## Not requested (intentional)

- `webRequest` / `webNavigation` / `cookies` / `history` / `bookmarks` — not used
- `storage.sync` — the API key must not leave the device
- `<all_urls>` as a *host permission* — only as a content-script match

## Message-sender trust (Phase 7, still in force)

- Message handler rejects `sender.id !== chrome.runtime.id`
- Query messages require an `http://` or `https://` tab URL
- Payloads are size-checked and scanned for API-key material before dispatch,
  covering all four provider key shapes (`sk-ant`, `sk-or-`, `gsk_`, `AIza`)
