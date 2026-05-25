# GitHub Pages — Privacy Policy Hosting

> **Agents:** This file is required reading when editing `docs/`, privacy HTML, store scenes, or the Pages workflow. Summary also lives in **`AGENTS.md`** § GitHub Pages and **`.cursor/rules/github-pages-deploy.mdc`** (always applied in Cursor).

## Live URL (after enabling Pages)

**Privacy policy:**  
https://officialhomie.github.io/deeplens/privacy/

**Site home:**  
https://officialhomie.github.io/deeplens/

Use the privacy URL in the Chrome Web Store **Privacy policy** field.

## One-time setup

1. Push `docs/` to **`main`** (or `master`).
2. Repo → **Settings** → **Pages** → Source: **GitHub Actions**
3. **Environments** → `github-pages` → ensure **`main`** is in deployment branches (default may only allow `dev` if that was your default branch).
4. Push or run workflow **Deploy GitHub Pages** (`.github/workflows/deploy-pages.yml`).
5. Wait ~1–2 minutes; verify the privacy URL loads.

### If you see GitHub’s generic 404

| Symptom | Fix |
|---------|-----|
| “There isn’t a GitHub Pages site here” | Pages was never enabled — run the workflow once (it uses `enablement: true`) or enable Actions source under Settings → Pages. |
| Workflow fails: “Get Pages site failed” | Same as above — enable Pages (Actions). |
| Workflow fails: branch not allowed to deploy | Settings → Environments → `github-pages` → add **`main`** to allowed deployment branches. |

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

## Deploy workflow (what we do exactly)

| Branch / action | Result |
|-----------------|--------|
| Push to **`main`** changing `docs/**` or `.github/workflows/deploy-pages.yml` | **Automatic redeploy** via Actions (~1–2 min) |
| Edit `docs/` on **`dev`** (or any non-`main` branch) | **No public update** until merged to `main` |
| Need to publish without merging yet | **Actions → Deploy GitHub Pages → Run workflow** → branch **`main`** |

**Default branch is `dev`:** routine extension work stays on `dev`; hosted site production is **`main`** only. The `github-pages` environment may only allow deployment from `main` (not `dev`).

After any deploy, verify:

```bash
curl -sI https://officialhomie.github.io/deeplens/privacy/ | head -1
# Expect: HTTP/2 200
```

## Updating the policy

1. Edit `docs/privacy/index.html` (optionally sync from `md/privacy/privacy-policy.md`).
2. Merge to **`main`** and push (or manual workflow run on `main`).
3. Wait for **Deploy GitHub Pages** to succeed; confirm the privacy URL loads.
