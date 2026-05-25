# Dev testing — load unpacked extension

## This is not the extension UI

The GitHub Pages site (`docs/index.html`) is a **marketing landing page**. Hovering text there does nothing unless you have installed the **Chrome extension** from `extension/dist`.

## Load unpacked (required)

1. `cd extension && npm run build`
2. Chrome → `chrome://extensions`
3. **Developer mode** ON
4. **Load unpacked** → choose **`extension/dist`** (not `extension/` root)
5. **Reload** any open tabs (or open a fresh tab)

## Popup setup (required)

1. Click the DeepLens toolbar icon
2. Enter a valid **Anthropic API key** (`sk-ant-…`, 20+ chars) → **Activate**
3. Finish or skip onboarding
4. In settings: **Active** ON, **Hover** ON, delay ~300ms

## Where to test

| Page | Works? |
|------|--------|
| https://officialhomie.github.io/deeplens/test/ | Yes — hover **eigenvalue** |
| Wikipedia / Medium / blogs | Yes |
| `chrome://` URLs, Chrome Web Store | No |
| Privacy/GitHub **buttons** on landing page | No — links are excluded |
| Words under 3 letters (“AI”) | No — filtered |

**Best test:** open `/deeplens/test/` after Pages deploy, or locally:

```bash
npx --yes serve docs -l 8080
# http://127.0.0.1:8080/test/
```

## Verify content script loaded

On the test tab: **DevTools → Console**. You should **not** need a special message in production builds; instead:

1. Hover **eigenvalue** for ~400ms → dark tooltip should appear
2. If nothing: check extension card on `chrome://extensions` for **Errors**

## Common “doesn’t work” causes

| Cause | Fix |
|-------|-----|
| Loaded wrong folder | Use `extension/dist` only |
| Tab opened before install | Reload tab |
| No API key | Add key in popup (tooltip may error but should still open) |
| Extension paused | Popup → **Active** ON |
| Hover disabled | Popup → hover trigger ON |
| Hovering a link/button | Hover plain paragraph text |
| Short words | Use 3+ letter words (e.g. **intelligence**, **eigenvalue**) |
| `npm run dev` without reload | After watch rebuild, click **Reload** on `chrome://extensions` |

## Watch mode

```bash
cd extension && npm run dev
```

After each rebuild, click **Reload** on the DeepLens card in `chrome://extensions`, then reload the page under test.
