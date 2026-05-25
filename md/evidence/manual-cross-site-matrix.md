# Manual Cross-Site Validation Matrix

**Phase:** 9 pre-release  
**Browser:** Chrome stable + unpacked `extension/dist`

## Sites (TRD §11.3)

| Site | Focus | Status |
|------|-------|--------|
| github.com | Code + CSP | [ ] Pending manual |
| medium.com | Long article | [ ] Pending manual |
| x.com / twitter.com | SPA DOM | [ ] Pending manual |
| notion.so | Default blacklist silence | [ ] Pending manual |
| mail.google.com | Default blacklist silence | [ ] Pending manual |
| arxiv.org | Academic content | [ ] Pending manual |
| docs.anthropic.com | Docs pages | [ ] Pending manual |
| Any `prefers-color-scheme: dark` page | Theme legibility | [ ] Pending manual |
| Strict CSP page | Tooltip + inline CSS fallback | [ ] Use `tests/e2e/fixtures/strict-csp.html` via local serve |

## Per-site checks

1. Hover 300ms on a word → tooltip loading → stream or error
2. Text selection → tooltip at selection
3. Escape dismisses tooltip
4. Input/textarea → no trigger
5. Popup settings persist after reload

## Sign-off

Engineering automated suite complete; product QA to tick matrix before CWS (Phase 10).
