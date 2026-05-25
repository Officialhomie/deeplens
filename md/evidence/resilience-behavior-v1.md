# Resilience Behavior — v1.0

**Date:** 2026-05-25  
**TRD reference:** §10.2, §10.3

## Error recovery matrix

| Error code | UI behavior | Retry |
|------------|-------------|-------|
| `NO_API_KEY` / `INVALID_KEY` | Message + Open settings | Popup |
| `RATE_LIMIT` | Countdown from `Retry-After` or 60s default | After countdown |
| `SESSION_RATE_LIMIT` | 3-minute countdown | After countdown |
| `API_OVERLOADED` | “Retrying shortly…” + auto-retry 3s | Auto + “Retry now” |
| `NETWORK_ERROR` | Check connection | Manual Retry |
| `CONNECTION_LOST` | “Connection lost. Tap to retry.” | Manual Retry |
| `BAD_REQUEST` / `API_ERROR` | Generic message | Manual Retry |
| `ABORTED` | Silent dismiss | — |

## Implementation map

| Scenario | Module |
|----------|--------|
| 429 + Retry-After | `claudeAPI.ts` → `parseRetryAfter` |
| Query dispatch failure | `queryCoordinator.ts` → `CONNECTION_LOST` |
| Stream stall (SW sleep / network drop) | `streamer.ts` 45s watchdog |
| Re-query same payload | `retryLastQuery()` in `queryCoordinator` |
| Cached instant replay | `responseCache.ts` + `applyCachedResponse` |

## Service worker termination

Content does not hold long-lived ports; recovery relies on:

1. Idle stream watchdog firing `CONNECTION_LOST`
2. User tapping **Retry** → new `DEEPLENS_QUERY` wakes the service worker

## Tests

- `retryAfter.test.ts` — header parsing
- `responseCache.test.ts` — TTL and key matching
- Existing `rateLimiter.test.ts` — session guard
