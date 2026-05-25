# Permission Audit — v1.0

**Date:** 2026-05-25  
**Manifest:** `extension/manifest.json`

## Declared permissions

| Permission | Purpose | Minimization |
|------------|---------|--------------|
| `storage` | API key + settings in `chrome.storage.local` | Required; no sync |
| `activeTab` | Extension action on current tab | Standard MV3 pattern |
| `scripting` | Reserved for future injection needs | Declared; unused in v1 code paths reviewed |

## Host permissions

| Pattern | Purpose |
|---------|---------|
| `https://api.anthropic.com/*` | Claude API streaming only |

## Content scripts

| Match | Notes |
|-------|-------|
| `<all_urls>` | Required for on-page triggers; does **not** grant page network access to extension secrets |

## Not requested (intentional)

- `tabs` broad read — not needed; `sender.tab` on messages suffices
- `<all_urls>` host permission — API calls use explicit Anthropic host only
- `webRequest` / `cookies` — not used

## Phase 7 additions

- Message handler rejects `sender.id !== chrome.runtime.id`
- Query messages require `https://` or `http://` tab URL
