# DeepLens v1.0.0 — Release Notes

**Release date:** May 2026  
**Build:** Chrome MV3 extension  
**Channel:** Initial public release (Chrome Web Store)

## Highlights

- **Hover & select triggers** — Get context on any word or selected phrase without leaving the page
- **Quick & Deep modes** — Fast summaries or richer explanations with mental models
- **Streaming tooltip** — Responses appear inline as they generate
- **Bring your own key** — Use your Anthropic API key; stored locally only
- **Adaptive UI** — Light/dark tooltip styling; pin panel for longer reads
- **Privacy-first v1** — No DeepLens backend; queries go directly to Anthropic

## Included in v1.0.0

- MV3 extension (Vite + CRXJS)
- Settings popup: API key, default mode, hover delay, hover/select toggles
- First-run onboarding flow
- Session mode memory per tab session
- Client-side rate guard and error recovery (retry, countdown)
- Security: payload validation, DOMPurify sanitization, closed Shadow DOM

## Known limitations

See `md/release/KNOWN_LIMITATIONS-v1.0.md`.

## Deferred (post-v1.0)

- Links mode, domain blacklist UI, copy-to-clipboard
- Hosted API / proxy (v1.1)
- Firefox, Safari, mobile
- Output language selector

## Upgrade / install

1. Install from Chrome Web Store (when published) or load unpacked from `extension/dist`
2. Open popup → paste Anthropic API key → Activate
3. Visit any http(s) page and hover a word for ~300ms

## Technical

- Model: `claude-sonnet-4-20250514`
- Minimum: Chrome current stable, MV3
