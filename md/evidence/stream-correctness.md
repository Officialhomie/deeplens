# Stream Correctness Evidence

**Date:** 2026-05-25

## Automated coverage

| Module | Tests |
|--------|-------|
| `sseParser.test.ts` | SSE block parsing |
| `streamSession.test.ts` | Active query per tab |
| `abortRace.test.ts` | Stale token / abort races |
| `streamRenderer.test.ts` | Markdown subset |
| `claudeAPI.test.ts` | Request token limits |

## Stale token prevention

`abortRace.test.ts` verifies `isActiveQuery` rejects superseded query ids — matches streamer `isStaleMessage` guard.

## Threshold

0 stale token leaks after abort — **covered** by unit regression suite.
