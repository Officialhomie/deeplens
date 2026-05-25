# Release Candidate — v1.0.0

**Date:** 2026-05-25  
**Candidate ID:** RC1

## Package

| Artifact | Path |
|----------|------|
| Store ZIP | `extension/release/deeplens-1.0.0.zip` |
| Unpacked load | `extension/dist/` |

**Generate:**
```bash
cd extension
npm run icons
npm run zip
```

## Manifest

- **version:** 1.0.0
- **MV3:** yes
- **Permissions:** storage, activeTab, scripting
- **Host:** https://api.anthropic.com/*

## Bundle verification (Phase 8)

| Asset | Gzipped | TRD limit |
|-------|---------|-----------|
| Content | ~15.8 KB | < 40 KB |
| Background | ~3.5 KB | < 20 KB |
| Popup | ~1.5 KB | < 15 KB |

## Test gates (Phase 9)

| Suite | Result |
|-------|--------|
| Unit | 79/79 pass |
| E2E | 7 pass, 1 skip |

## Documentation bundle

- `md/release/RELEASE_NOTES-v1.0.0.md`
- `md/release/store-listing.md`
- `md/privacy/privacy-policy.md`
- `md/release/KNOWN_LIMITATIONS-v1.0.md`
- `md/release/SUPPORT-v1.0.md`
- `md/checklists/cws-submission-checklist.md`

## Approval

**Engineering:** RC1 built and documented.  
**Product:** Approve listing copy + screenshots before CWS upload.
