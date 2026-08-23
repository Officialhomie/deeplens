# DeepLens Privacy Policy

**Effective date:** August 23, 2026  
**Version:** 1.1  
**Applies to:** DeepLens Chrome extension v1.0.0 (direct API / bring-your-own-key mode)

> Hosted copy: `docs/privacy/index.html` — keep the two in sync. Pages deploys
> from `main` only; see `md/release/GITHUB_PAGES.md`.

## Summary

DeepLens runs entirely on your device. There is no DeepLens server, so there is
nothing for us to log, store, or sell. When you trigger a lookup, the selected
text and its surrounding context are sent **directly from your browser** to the
**AI provider you chose**, authenticated with **your own API key**.

## Choose your provider

DeepLens supports four providers. You pick one and supply your own key for it:

| Provider | Endpoint |
|----------|----------|
| Anthropic (Claude) | `api.anthropic.com` |
| Google Gemini | `generativelanguage.googleapis.com` |
| Groq | `api.groq.com` |
| OpenRouter | `openrouter.ai` |

Only the provider you have selected ever receives your data. DeepLens does not
contact the other three.

## What data is processed

Sent to your selected provider **only when you trigger a lookup** — by hovering
a word for about 300ms, or selecting a phrase:

| Data | Where it goes | Why |
|------|---------------|-----|
| The word or phrase you selected | Your selected provider's API | Generate the explanation |
| Surrounding sentence, paragraph and heading | Your selected provider's API | Disambiguate the term in context |
| Page title, URL and domain | Your selected provider's API | Context for the response |
| Your API key | Stored locally in `chrome.storage.local`; sent only to your selected provider | Authenticate the request |

When you are not triggering a lookup, nothing leaves your browser.

## How your API key is protected

- The key is stored using Chrome's extension storage on your device.
- It is read **only** by the extension's background service worker, in a single
  module, at the moment it signs a request to your provider.
- It is never placed in a message that a web page can observe, and never sent to
  the page you are reading.
- Before any request payload is sent, it is scanned for API-key patterns and
  rejected if one is found — a defence against accidental key leakage.
- Debug logging redacts key material.

## What we do not collect

- No DeepLens account or login
- No DeepLens server, and therefore no server-side query logging
- No analytics, telemetry, advertising identifiers, or trackers
- No browsing history collection
- No sale or sharing of personal data
- No storage of the page content you look things up on

## Local storage

Your settings — API key, provider choice, hover delay, default mode, and the
enable toggles — are stored in **Chrome local extension storage** on your device.
Uninstalling the extension or clearing its data removes all of it.

## Third parties

The provider you select processes the text you send. Their handling of that data
is governed by their own policies, and your use of your key is subject to their
terms:

- [Anthropic](https://www.anthropic.com/legal/privacy)
- [Google Gemini](https://policies.google.com/privacy)
- [Groq](https://groq.com/privacy-policy/)
- [OpenRouter](https://openrouter.ai/privacy)

DeepLens has no business relationship with these providers; you are using your
own account with them.

## Permissions (Chrome)

Requested at install:

| Permission | Purpose |
|------------|---------|
| `storage` | Save your settings and API key locally on your device |
| Access to sites you visit (content script) | Read the text around what you hover or select, so it can be explained. Applies only when you trigger a lookup. Page content is never stored or transmitted anywhere except to your selected provider as part of that lookup. |

Requested later, only when needed:

| Optional permission | When it is requested |
|---------------------|----------------------|
| `api.anthropic.com` | Only if you select Anthropic |
| `generativelanguage.googleapis.com` | Only if you select Google Gemini |
| `api.groq.com` | Only if you select Groq |
| `openrouter.ai` | Only if you select OpenRouter |

No provider access is granted when you install DeepLens. The extension asks for
exactly one provider origin, at the moment you configure that provider. If you
later switch providers, the previous provider's access is released.

Content scripts run on the pages you visit so hover and selection can work. They
never receive your API key. The explanation panel is rendered inside a closed
shadow root, so the page you are reading cannot read what you looked up.

## Your choices

- Disable the extension globally in the popup
- Turn off hover or selection triggers
- Remove or change your API key at any time
- Stop using the extension on sensitive sites (domain blacklist support is planned; storage field exists in v1.0)

## Children

DeepLens is not directed at children under 13.

## Changes

We may update this policy when the product changes (for example, if a hosted API option is added). The effective date will be revised.

## Contact

For privacy questions about DeepLens, contact the publisher listed on the Chrome Web Store listing.

---

*Host this document at a public HTTPS URL and paste that URL into the Chrome Web Store “Privacy policy” field.*
