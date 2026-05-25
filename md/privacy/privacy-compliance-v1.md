# Privacy Compliance Notes — v1.0 (Direct API)

**Date:** 2026-05-25  
**Mode:** User-supplied Anthropic API key (no DeepLens server in v1.0)

## What leaves the device

| Data | Destination | When |
|------|-------------|------|
| Selected text + page context | Anthropic API (`api.anthropic.com`) | User triggers hover/select lookup |
| API key | Anthropic API (header) | Same request; never sent to page JS |

## What is not collected (v1.0)

- No DeepLens backend query logging
- No analytics SDK in extension bundle
- No third-party telemetry endpoints

## User disclosure (in product)

- Popup footer: text sent to Anthropic API (Phase 6)
- Chrome Web Store listing + privacy policy URL (release phase)

## User controls

- Global enable/disable toggle
- Hover vs selection triggers
- Domain blacklist storage field (UI deferred v1.5; schema present)

## Data at rest

- Settings + API key: `chrome.storage.local` on device only
- Cleared when user uninstalls extension or clears extension data

## Phase 7 technical controls

- Payload size limits on context fields
- Secret pattern rejection in outbound query payloads
- Sanitized HTML before tooltip `innerHTML`

## Follow-ups (out of Phase 7)

- Published privacy policy page for CWS
- Blacklist UI (v1.5)
- Hosted proxy mode privacy copy (v1.1)
