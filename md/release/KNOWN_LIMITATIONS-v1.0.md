# Known Limitations — v1.0.0

## Product

| Limitation | Workaround |
|------------|------------|
| Chrome only | No Firefox/Safari build in v1.0 |
| Requires Anthropic API key | User must create key at Anthropic; usage billed by Anthropic |
| English output only | Output language setting deferred |
| No Links mode | Use Deep mode for richer context |
| No domain blacklist UI | Avoid sensitive sites manually; blacklist field in storage for future UI |
| No copy-to-clipboard in tooltip | Select and copy from pinned panel manually |
| No keyboard shortcut | Use hover or selection |

## Technical

| Limitation | Notes |
|------------|-------|
| Service worker may sleep | Stream may stall; use Retry if connection lost |
| Strict host CSP | Tooltip uses Shadow DOM + inline CSS fallback |
| Very long pages / SPAs | Dynamic DOM may shift position; dismiss and re-trigger |
| `mouseover` on all URLs | Intentional; disable extension on sites you do not trust |

## Not bugs (by design)

- API key never exposed to page JavaScript
- Abort dismisses tooltip silently during loading
- Links mode selector hidden in v1.0 (Deep used if legacy setting)

## Reporting issues

Use the support channel in `md/release/SUPPORT-v1.0.md` or the store listing support link.
