# DeepLens

AI-powered contextual intelligence layer for the web — a Chrome extension that delivers deep context on any word or phrase without leaving the page.

## Documentation

| Document | Path | Description |
|----------|------|-------------|
| **PRD** | [`md/deeplens-prd.md`](md/deeplens-prd.md) | Product Requirements Document v1.0 |
| **TRD** | [`md/deeplens-trd.md`](md/deeplens-trd.md) | Technical Requirements Document v1.0 |
| **Design Brief** | [`md/deeplens-design-brief.md`](md/deeplens-design-brief.md) | UI/UX design brief — palette, typography, components, screens |
| **App Flow** | [`deeplens-app-flow.html`](deeplens-app-flow.html) | Interactive app flow documentation (open in browser) |

## Quick Start

### Extension (development)

```bash
cd extension
npm install
npm run icons
npm run build
# Chrome → chrome://extensions → Load unpacked → extension/dist
```

### Release package (Chrome Web Store)

```bash
cd extension
npm run zip
# Upload extension/release/deeplens-1.0.0.zip to CWS Developer Dashboard
```

See [`md/checklists/cws-submission-checklist.md`](md/checklists/cws-submission-checklist.md), [`md/release/store-listing-cws-paste.md`](md/release/store-listing-cws-paste.md), and [`md/release/SCREENSHOTS.md`](md/release/SCREENSHOTS.md).

**Privacy policy (hosted):** https://officialhomie.github.io/deeplens/privacy/ — deploy via [GitHub Pages](md/release/GITHUB_PAGES.md).

### App flow doc

```bash
open deeplens-app-flow.html
```

## Execution

| Resource | Path |
|----------|------|
| **Implementation plan** | [`md/deeplens-implementation-plan.md`](md/deeplens-implementation-plan.md) |
| **v1 scope freeze** | [`md/scope/v1-scope-freeze.md`](md/scope/v1-scope-freeze.md) |
| **Module naming contract** | [`md/contracts/module-naming-map.md`](md/contracts/module-naming-map.md) |
| **Release notes** | [`md/release/RELEASE_NOTES-v1.0.0.md`](md/release/RELEASE_NOTES-v1.0.0.md) |
| **Privacy policy** | [`md/privacy/privacy-policy.md`](md/privacy/privacy-policy.md) |
| **Agent guide** | [`AGENTS.md`](AGENTS.md) |

## Project Status

- **Build phase:** Phases 0–10 complete — **v1.0.0 release candidate ready**
- **Version:** 1.0.0
- **Author:** 0xVerse / eth-content-architect
- **Date:** May 2026
