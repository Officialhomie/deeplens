# Chrome Web Store Submission Checklist

**Version:** 1.0.0  
**Captured:** 2026-05-25  
**Package:** `extension/release/deeplens-1.0.0.zip`

## Build package

- [x] `npm run build` succeeds
- [x] Icons 16 / 48 / 128 present (`npm run icons`)
- [x] `npm run zip` produces store ZIP (no `.map`, no `node_modules`)
- [x] `manifest.json` version `1.0.0` matches submission

## Security & permissions (TRD §12.5)

- [x] `host_permissions` only `https://api.anthropic.com/*`
- [x] No `eval` / remote code in bundle
- [x] API key isolated from page context (`md/evidence/api-key-secrecy.md`)
- [x] Permission justification in store listing (`md/release/store-listing.md`)

## Listing

- [x] Privacy policy hosted at public HTTPS URL (GitHub Pages — enable Actions)
- [ ] Privacy policy URL entered in CWS dashboard → https://officialhomie.github.io/deeplens/privacy/
- [ ] Short + detailed description pasted from `md/release/store-listing.md`
- [ ] Screenshots generated (`npm run screenshots`) and uploaded (≥1)
- [ ] Category: Productivity
- [ ] Support / contact email set

## QA before submit

- [x] Unit tests 79/79 (`npm run test:unit`)
- [x] E2E 7/7 executed (`npm run test:e2e`)
- [ ] Manual cross-site matrix (`md/evidence/manual-cross-site-matrix.md`)
- [ ] Tested on **Chrome stable** (not only Canary)

## Post-submit

- [ ] Monitor review feedback
- [ ] Tag git release `v1.0.0` when approved (optional)
