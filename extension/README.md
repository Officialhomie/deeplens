# DeepLens Extension

Chrome MV3 extension package (Phase 1+).

## Commands

```bash
npm install
npm run icons    # generate placeholder icons
npm run build    # production build → dist/
npm run dev      # watch build
npm test         # Vitest unit tests
```

## Load unpacked

1. Run `npm run build`
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. **Load unpacked** → select `extension/dist`

## Structure

See `md/contracts/module-naming-map.md` for module boundaries.
