# Chrome Web Store Listing — DeepLens v1.0.0

**Package:** `extension/release/deeplens-1.0.0.zip`  
**Manifest version:** `1.0.0`

## Listing copy

### Name
DeepLens

### Short description (≤ 132 chars)
Hover or select any text for an instant AI explanation in context. Bring your own key — Claude, Gemini, Groq, or OpenRouter.

**Privacy policy URL:** https://officialhomie.github.io/deeplens/privacy/

**Paste-ready copy:** `md/release/store-listing-cws-paste.md`

### Detailed description

DeepLens explains what you are reading without making you leave the page.

Pause on a word for about 300ms, or select a phrase, and a panel opens next to it
with an AI explanation that streams in as it is generated. The explanation is
written against the surrounding sentence and paragraph, so an ambiguous term is
read the way the page means it — "transformer" on a machine-learning paper is not
"transformer" on an electrical-engineering one.

**How it works**
- Hover any word for ~300ms, or select a phrase, to trigger a lookup
- The panel streams the answer inline; nothing opens in a new tab
- Quick mode for a fast definition, Deep mode for fuller context
- Pin the panel to keep it open, or press Escape to dismiss it
- Turn hover or selection triggers off independently in settings

**Bring your own API key**
DeepLens has no subscription and no DeepLens account, because it has no server.
You supply an API key for one of four providers and the extension talks to that
provider directly:

- Anthropic (Claude)
- Google Gemini — has a free tier
- Groq — has a free tier
- OpenRouter

Your key is stored using Chrome's extension storage on your own device. It is
read only by the extension's background service worker when it signs a request
to the provider you chose. It is never sent to the page you are reading, never
included in any message the page can observe, and never transmitted anywhere
except to that provider.

**What is sent, and to whom**
When you trigger a lookup, DeepLens sends to your chosen provider: the word or
phrase you selected, the sentence and paragraph around it, the page heading, and
the page title, URL and domain — the context needed to explain the term
accurately. That request goes to your provider and nowhere else. There is no
DeepLens server, no analytics, no telemetry, and no advertising identifier. When
you are not triggering a lookup, nothing is transmitted at all.

**Permissions, and why each is needed**
- **storage** — keeps your settings and API key on your device. This is the only
  permission requested at install.
- **Access to the sites you visit** — DeepLens reads the text around what you
  hover or select in order to explain it. This is how the extension works at all;
  it applies only when you trigger a lookup, and page content is never stored.
- **Provider access (requested later, not at install)** — the four provider API
  origins are *optional* permissions. DeepLens asks for exactly one of them, for
  the provider you actually selected, at the moment you set it up. Choosing a
  different provider later releases the previous one.

**Good for**
Readers of technical documentation, research papers, legal and financial
writing, and anyone reading in a field they are still learning — where the
blocker is usually one unfamiliar term per paragraph, not the whole page.

**v1.0 notes**
- Chrome only (Manifest V3)
- Responses in English
- Requires your own API key from one of the four providers above
- Domain blacklist UI and a copy-to-clipboard shortcut are planned for a
  follow-up release

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
