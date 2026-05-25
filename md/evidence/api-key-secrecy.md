# API Key Secrecy — Phase 7 Evidence

**Date:** 2026-05-25  
**TRD reference:** §8.1

## Guarantees implemented

| Requirement | Implementation |
|-------------|----------------|
| Key only in `chrome.storage.local` | `storage.set('apiKey')` from popup only |
| Content never reads key | `storage.getPublicSettings()` omits `apiKey` |
| Background reads key for fetch | `getApiKey()` in `storageSecure.ts` |
| Key not in query messages | `validateQueryPayload` + `assertPayloadHasNoSecrets` |
| Key not returned to content | `claudeAPI` uses key only in `x-api-key` header |

## Code paths audited

- **Content:** `detector`, `queryCoordinator`, `streamer`, `tooltip` — no `storage.get('apiKey')`
- **Background:** `messageRouter` → `getApiKey()` → `streamClaudeResponse`
- **Popup:** `popup.ts` may read/write key (extension page, TRD-allowed)

## Automated checks

- `tests/unit/storage.test.ts` — `getPublicSettings omits apiKey`
- `tests/unit/validatePayload.test.ts` — rejects `sk-ant-…` in payload fields

## Residual risk (accepted for v1)

- User machine compromise can read `chrome.storage.local` (same as any local secret)
- Hosted proxy mode (v1.1) not in scope — key remains user-supplied for v1.0
