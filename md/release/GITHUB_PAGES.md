# GitHub Pages — Privacy Policy Hosting

## Live URL (after enabling Pages)

**Privacy policy:**  
https://officialhomie.github.io/deeplens/privacy/

**Site home:**  
https://officialhomie.github.io/deeplens/

Use the privacy URL in the Chrome Web Store **Privacy policy** field.

## One-time setup

1. Push `docs/` to GitHub (`main` or `master` branch).
2. Repo → **Settings** → **Pages**
3. **Build and deployment** → Source: **GitHub Actions**
4. Merge or run workflow **Deploy GitHub Pages** (`.github/workflows/deploy-pages.yml`)
5. Wait ~1–2 minutes; verify the privacy URL loads.

## Local preview

```bash
npx --yes serve docs -l 8080
open http://127.0.0.1:8080/privacy/
```

## Files

| Path | Purpose |
|------|---------|
| `docs/index.html` | Landing page |
| `docs/privacy/index.html` | Hosted privacy policy (CWS) |
| `.github/workflows/deploy-pages.yml` | Auto-deploy on push |

## Updating the policy

Edit `docs/privacy/index.html` (and optionally sync from `md/privacy/privacy-policy.md`). Push to `main` — Pages redeploys automatically.
