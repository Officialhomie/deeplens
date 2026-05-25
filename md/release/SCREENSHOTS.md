# CWS Screenshots — DeepLens v1.0.0

## Requirements

- **Size:** 1280×800 or 640×400 PNG/JPEG
- **Count:** At least 1; recommend 4–5

## Generate automatically

```bash
cd extension
npm run screenshots
```

Output: `docs/store-assets/captured/`

| File | Scene |
|------|--------|
| `01-hover-streaming.png` | Article + Quick mode streaming tooltip |
| `02-popup-settings.png` | Settings popup (API key, modes, triggers) |
| `03-deep-pinned.png` | Deep mode pinned panel |
| `04-onboarding.png` | Onboarding steps |
| `05-popup-live.png` | Live extension popup (if Chromium + extension load succeeds) |

## Edit scenes

Marketing HTML (no API required):  
`docs/store-assets/scenes/*.html`

Shared tooltip styles: `docs/store-assets/scenes/tooltip-demo.css`

## Manual capture (optional)

1. Load unpacked extension on a real article
2. Trigger hover / pin / settings
3. Screenshot at 1280×800 (macOS: Cmd+Shift+4 → space, or DevTools device mode)

## Upload

Chrome Web Store Developer Dashboard → Store listing → Screenshots → drag PNGs from `docs/store-assets/captured/`.
