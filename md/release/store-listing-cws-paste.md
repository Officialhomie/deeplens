# Chrome Web Store — Paste-Ready Copy

**Privacy policy URL:** https://officialhomie.github.io/deeplens/privacy/

> Source of truth for listing wording: `md/release/store-listing.md`.
> Keep both files in sync when either changes.

---

## Name
```
DeepLens
```

## Short description (132 char max)
```
Hover or select any text for an instant AI explanation in context. Bring your own key — Claude, Gemini, Groq, or OpenRouter.
```

## Category
```
Productivity
```

## Language
```
English
```

---

## Detailed description

```
DeepLens explains what you are reading without making you leave the page.

Pause on a word for about 300ms, or select a phrase, and a panel opens next to it with an AI explanation that streams in as it is generated. The explanation is written against the surrounding sentence and paragraph, so an ambiguous term is read the way the page means it — "transformer" on a machine-learning paper is not "transformer" on an electrical-engineering one.

HOW IT WORKS
• Hover any word for ~300ms, or select a phrase, to trigger a lookup
• The panel streams the answer inline; nothing opens in a new tab
• Quick mode for a fast definition, Deep mode for fuller context
• Pin the panel to keep it open, or press Escape to dismiss it
• Turn hover or selection triggers off independently in settings

BRING YOUR OWN API KEY
DeepLens has no subscription and no DeepLens account, because it has no server. You supply an API key for one of four providers and the extension talks to that provider directly:
• Anthropic (Claude)
• Google Gemini — has a free tier
• Groq — has a free tier
• OpenRouter

Your key is stored using Chrome's extension storage on your own device. It is read only by the extension's background service worker when it signs a request to the provider you chose. It is never sent to the page you are reading, never included in any message the page can observe, and never transmitted anywhere except to that provider.

WHAT IS SENT, AND TO WHOM
When you trigger a lookup, DeepLens sends to your chosen provider: the word or phrase you selected, the sentence and paragraph around it, the page heading, and the page title, URL and domain — the context needed to explain the term accurately. That request goes to your provider and nowhere else. There is no DeepLens server, no analytics, no telemetry, and no advertising identifier. When you are not triggering a lookup, nothing is transmitted at all.

PERMISSIONS, AND WHY EACH IS NEEDED
• storage — keeps your settings and API key on your device. This is the only permission requested at install.
• Access to the sites you visit — DeepLens reads the text around what you hover or select in order to explain it. This is how the extension works at all; it applies only when you trigger a lookup, and page content is never stored.
• Provider access (requested later, not at install) — the four provider API origins are optional permissions. DeepLens asks for exactly one of them, for the provider you actually selected, at the moment you set it up. Choosing a different provider later releases the previous one.

GOOD FOR
Readers of technical documentation, research papers, legal and financial writing, and anyone reading in a field they are still learning — where the blocker is usually one unfamiliar term per paragraph, not the whole page.

V1.0 NOTES
• Chrome only (Manifest V3)
• Responses in English
• Requires your own API key from one of the four providers above
• Domain blacklist UI and a copy-to-clipboard shortcut are planned for a follow-up release
```

---

## Single-purpose description (if CWS asks for narrow purpose)

```
DeepLens has one purpose: when the user hovers or selects text on a page, it sends that text plus its surrounding context to an AI provider the user configured with their own API key, and displays the returned explanation in a panel on the page.
```

---

## Permission justification (review notes)

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | Required | Persist the user's provider choice, API key and preferences on the local device. The only permission requested at install. |
| `<all_urls>` content script | Required | The core interaction is hover/select on arbitrary pages, so the content script must be able to run on any site the user reads. It reads the text surrounding the user's trigger to build the query. It does not run until the user hovers or selects, stores no page content, and never receives the API key. |
| `https://api.anthropic.com/*` | **Optional** | Requested only if the user selects Anthropic. Sends the user-initiated query and streams the response back. |
| `https://generativelanguage.googleapis.com/*` | **Optional** | Requested only if the user selects Google Gemini. |
| `https://api.groq.com/*` | **Optional** | Requested only if the user selects Groq. |
| `https://openrouter.ai/*` | **Optional** | Requested only if the user selects OpenRouter. |

**Notes for the reviewer**

- No permission for a provider is granted at install. Each is an
  `optional_host_permissions` entry requested via `chrome.permissions.request()`
  from a user gesture in the settings popup, for the single provider selected.
  Switching providers releases the previous origin via `chrome.permissions.remove()`.
- The extension declares **no** `web_accessible_resources`. Nothing it ships can
  be fetched or probed by a host page.
- The API key is read only in the background service worker (`storageSecure.ts`)
  and never crosses into a content script message.
- No remote code is loaded or executed. The CSP is `script-src 'self'; object-src 'self'`.
- The tooltip renders into a **closed** shadow root, so the host page cannot read
  what the user looked up.
