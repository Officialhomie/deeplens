# Settings Persistence Evidence

**Date:** 2026-05-25

## Automated coverage

- `tests/unit/storage.test.ts` — defaults, get/set, getAll, getPublicSettings (no apiKey leak)
- `tests/unit/settingsUtils.test.ts` — API key format validation
- E2E `seedExtensionSettings` — chrome.storage.local seeding for runtime tests

## Popup persistence

Manual verify: change hover delay / toggles in popup → reload page → behavior updates (Phase 6 + manual matrix).
