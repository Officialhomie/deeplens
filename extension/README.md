# DeepLens Extension

Chrome MV3 extension — v1.0.0 release candidate.

## Commands

```bash
npm install
npm run icons      # generate PNG icons (16, 48, 128)
npm run build      # production build → dist/
npm run dev        # watch build
npm run test:unit  # Vitest (79 tests)
npm run test:e2e   # Playwright + loaded extension
npm test           # unit + e2e
npm run measure    # TRD §9.1 bundle sizes
npm run zip        # build + package → release/deeplens-1.0.0.zip
npm run screenshots  # CWS PNGs → ../docs/store-assets/captured/
```

## Load unpacked (development)

1. `npm run build`
2. `chrome://extensions` → Developer mode → **Load unpacked** → `extension/dist`

## Chrome Web Store

1. `npm run zip`
2. Upload `release/deeplens-1.0.0.zip`
3. Follow [`md/checklists/cws-submission-checklist.md`](../md/checklists/cws-submission-checklist.md)

## Structure

See [`md/contracts/module-naming-map.md`](../md/contracts/module-naming-map.md).
