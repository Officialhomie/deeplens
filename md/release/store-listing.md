# Chrome Web Store Listing — DeepLens v1.0.0

**Package:** `extension/release/deeplens-1.0.0.zip`  
**Manifest version:** `1.0.0`

## Listing copy

### Name
DeepLens

### Short description (≤ 132 chars)
Understand any word in context—streaming AI explanations inline. Bring your own Anthropic API key. Reading flow stays intact.

**Privacy policy URL:** https://officialhomie.github.io/deeplens/privacy/

**Paste-ready copy:** `md/release/store-listing-cws-paste.md`

### Detailed description

DeepLens is a reading companion for the web. Hover over a word (or select a phrase) and get a streaming AI panel with quick or deep context—definitions, mental models, and relevance to what you are reading—without opening new tabs.

**How it works**
- Hover for ~300ms or select text to trigger
- Tooltip streams Claude responses inline
- Quick mode for fast answers; Deep mode for richer context
- Pin the panel to read longer responses

**Privacy & your key**
- You provide your own Anthropic API key (`sk-ant-…`)
- Your key is stored **only on your device** in Chrome extension storage
- Selected text is sent to **Anthropic’s API** to generate responses—not to a DeepLens server
- See our privacy policy URL in the listing

**Permissions explained**
- **storage** — save settings and API key locally
- **activeTab** — work with the page you are reading
- **Host access to api.anthropic.com** — call the Claude API from the extension background

**v1.0 notes**
- Chrome only (MV3)
- English output
- Domain blacklist UI coming in a future update

### Category
Productivity

### Language
English

## Assets checklist

| Asset | Spec | Status |
|-------|------|--------|
| Icon 128×128 | PNG | Generate via `npm run icons` |
| Screenshots | 1280×800 or 640×400, ≥1 | Run `npm run screenshots` → `docs/store-assets/captured/` |
| Promo tile | Optional | [ ] |
| Privacy policy URL | Public HTTPS | https://officialhomie.github.io/deeplens/privacy/ |

## Suggested screenshots (manual)

1. Article with hover tooltip streaming
2. Deep mode pinned panel
3. Popup settings with API key + mode controls
4. Error state with clear retry/settings CTA
