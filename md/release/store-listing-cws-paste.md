# Chrome Web Store — Paste-Ready Copy

**Privacy policy URL:** https://officialhomie.github.io/deeplens/privacy/

---

## Name
```
DeepLens
```

## Short description (132 char max)
```
Understand any word in context—streaming AI explanations inline. Bring your own Anthropic API key. Reading flow stays intact.
```
*(131 characters)*

### Alternate short (if you want “Deep” emphasis)
```
Deep context on any word or phrase—streamed inline while you read. Your Anthropic key stays on your device only.
```
*(108 characters)*

---

## Detailed description (paste into “Description”)

```
DeepLens is a reading companion for Chrome. Pause on a word—or highlight a phrase—and get streaming AI context right on the page: what it means, how it fits what you’re reading, and the mental models behind it. No tab switching. No broken flow.

HOW IT WORKS
• Hover ~300ms on a word, or select text, to open the DeepLens panel
• Quick mode: fast, focused answers
• Deep mode: richer explanations with structure and relevance
• Pin the panel to read longer responses comfortably
• Press Escape or click away to dismiss

YOUR API KEY, YOUR DATA
• You connect your own Anthropic API key (sk-ant-…)
• Your key is stored only in Chrome extension storage on your device
• DeepLens does not run a backend that logs your reading in v1.0
• When you look something up, selected text and page context go to Anthropic’s API to generate the answer—not to DeepLens servers
• Privacy policy: https://officialhomie.github.io/deeplens/privacy/

PERMISSIONS — WHY WE ASK
• storage — save your settings and API key locally
• activeTab — interact with the page you’re reading
• Host permission for api.anthropic.com — stream responses from the Claude API in the background

BUILT FOR RESEARCHERS, BUILDERS, AND LEARNERS
Whether you’re in technical docs, long-form articles, or dense news, DeepLens turns “what does that mean?” into a one-second pause instead of a ten-tab detour.

V1.0 NOTES
• Chrome (Manifest V3) · English output
• Requires an Anthropic API key and account
• Domain blacklist UI coming in a future update
```

---

## Category
```
Productivity
```

## Language
```
English
```

## Homepage (optional)
```
https://officialhomie.github.io/deeplens/
```

## Support / contact
Use your Chrome Web Store developer contact email or:
```
https://github.com/Officialhomie/deeplens/issues
```

---

## Single-purpose description (if CWS asks for narrow purpose)

```
DeepLens provides on-page AI explanations of words and phrases while you browse, using the user’s own Anthropic API key.
```

---

## Permission justification (review notes)

| Permission | Justification |
|------------|---------------|
| storage | Persist API key and user preferences locally |
| activeTab | Run extension features on the current tab when user invokes the action |
| scripting | Extension architecture (reserved for injection helpers) |
| api.anthropic.com | Send user-initiated text to Claude API and stream responses back |

Content scripts match web pages for hover/selection; they never access the API key.
