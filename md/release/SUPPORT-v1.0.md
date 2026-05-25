# DeepLens v1.0 — Support Notes

## First-time setup

1. Install the extension
2. Open the DeepLens popup (toolbar icon)
3. Paste a valid Anthropic API key (`sk-ant-…`, 20+ characters)
4. Click **Activate** and complete optional onboarding
5. On any normal web page, hover a word for ~300ms or select 3+ characters

## Common issues

### “Invalid or missing API key”
- Open popup → re-enter key from [Anthropic Console](https://console.anthropic.com/)
- Ensure key has API access and billing enabled

### Tooltip does not appear
- Check **Active** toggle in popup
- Enable hover and/or selection triggers
- Avoid inputs, textareas, and code blocks (excluded by design)
- Try a simple article page (not `chrome://` or Web Store)

### “Too many requests”
- Anthropic rate limit: wait for countdown or Retry
- Session guard: max 30 queries per 10 minutes—wait a few minutes

### Stream stops mid-response
- Tap **Retry** or re-hover the word
- Check network; service worker may have slept (MV3)

### Tooltip styling looks unstyled
- Rare on strict CSP sites; inline CSS fallback should apply
- Reload page and try again

## Privacy

- Key and settings: local device only
- Query text: sent to Anthropic when you trigger a lookup
- Full policy: see store listing privacy URL (`md/privacy/privacy-policy.md`)

## Uninstall

Remove via `chrome://extensions` — local storage is cleared with extension data.
