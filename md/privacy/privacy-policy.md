# DeepLens Privacy Policy

**Effective date:** May 25, 2026  
**Version:** 1.0  
**Applies to:** DeepLens Chrome extension v1.0.0 (direct API / bring-your-own-key mode)

## Summary

DeepLens runs on your device. We do not operate a DeepLens backend that stores your reading activity in v1.0. When you trigger a lookup, selected text and page context are sent **directly from your browser** to **Anthropic’s API** using **your own API key**.

## What data is processed

| Data | Where it goes | Why |
|------|---------------|-----|
| Selected word or phrase | Anthropic API | Generate AI explanation |
| Surrounding sentence / paragraph / heading | Anthropic API | Context for the response |
| Page title, URL, domain | Anthropic API | Context for the response |
| Your Anthropic API key | Stored locally in `chrome.storage.local`; sent only to `api.anthropic.com` | Authenticate API requests |

## What we do not collect (v1.0)

- No DeepLens account or login
- No DeepLens server-side query logging
- No analytics or advertising trackers in the extension
- No sale of personal data

## Local storage

Settings (including your API key, hover delay, default mode, and enable toggles) are stored in **Chrome local extension storage** on your device. Uninstalling the extension or clearing extension data removes this storage.

## Third parties

**Anthropic** processes text you send when you use the extension. Their handling of data is governed by [Anthropic’s policies](https://www.anthropic.com/legal/privacy). You must comply with Anthropic’s terms when using your API key.

## Permissions (Chrome)

| Permission | Purpose |
|------------|---------|
| `storage` | Save settings and API key locally |
| `activeTab` | Extension action on the current tab |
| `scripting` | Reserved for extension injection patterns |
| Host: `api.anthropic.com` | Stream AI responses from Claude API |

Content scripts run on web pages you visit so hover/selection can work; they do **not** receive your API key.

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
