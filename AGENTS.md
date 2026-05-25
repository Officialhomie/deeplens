# DeepLens — Agent Execution Guide

## Source of truth

Build order is defined in **`md/deeplens-implementation-plan.md`**. Phases **0–10** are complete for v1.0 release candidate.

## Current phase

| Phase | Status | Report |
|-------|--------|--------|
| 0–9 | Done | `md/status/phase-0.md` … `md/status/phase-9.md` |
| **10 — Release Readiness** | Done | `md/status/phase-10.md` |
| **11 — Post-v1 Backlog Gate** | Optional | Process gate after CWS submit |

## Release (v1.0.0)

```bash
cd extension
npm run zip          # → release/deeplens-1.0.0.zip
```

| Artifact | Path |
|----------|------|
| Store listing copy | `md/release/store-listing.md` |
| Privacy policy (source) | `md/privacy/privacy-policy.md` |
| Privacy policy (hosted) | https://officialhomie.github.io/deeplens/privacy/ — deploy rules: `md/release/GITHUB_PAGES.md` |
| CWS checklist | `md/checklists/cws-submission-checklist.md` |
| GitHub Pages deploy | `md/release/GITHUB_PAGES.md` |
| Release notes | `md/release/RELEASE_NOTES-v1.0.0.md` |

## Required reads before coding

1. `md/scope/v1-scope-freeze.md` — what ships in v1.0
2. `md/contracts/module-naming-map.md` — where files live (`extension/` package)
3. `md/deeplens-trd.md` — module contracts and APIs
4. **`md/release/GITHUB_PAGES.md`** — if you touch `docs/`, privacy HTML, store scenes, or the Pages workflow (see § GitHub Pages below)

## GitHub Pages (hosted privacy + docs)

**Read first:** `md/release/GITHUB_PAGES.md` · **Cursor rule:** `.cursor/rules/github-pages-deploy.mdc`

| URL | Purpose |
|-----|---------|
| https://officialhomie.github.io/deeplens/privacy/ | CWS privacy policy (canonical public URL) |
| https://officialhomie.github.io/deeplens/ | Site landing |

**Deploy rules (what we do exactly):**

- **Auto-deploy:** Any push to **`main`** that changes `docs/**` or `.github/workflows/deploy-pages.yml` triggers **Deploy GitHub Pages** and updates the live site (~1–2 min).
- **Work on `dev`:** Changes to `docs/` on `dev` do **not** update the public site until they are on **`main`**. Merge (or cherry-pick) to `main` and push, **or** run **Actions → Deploy GitHub Pages → Run workflow** on branch **`main`**.
- **Default branch is `dev`:** Do not assume pushing `dev` publishes Pages; production is **`main`** only.
- **Verify after deploy:** Confirm the privacy URL returns HTTP 200 before changing CWS listing copy.

**Key paths:** `docs/privacy/index.html` (hosted), `md/privacy/privacy-policy.md` (source to sync), workflow `.github/workflows/deploy-pages.yml`.

**If the site shows GitHub’s generic 404:** Pages may be disabled, or `github-pages` environment may block `main` — see troubleshooting table in `md/release/GITHUB_PAGES.md`.

## Handoff format

When completing work, update the active `md/status/phase-X.md` using the protocol in the implementation plan § Agent Handoff Protocol.

## Scope rules

- **P0** = mandatory for v1.0 release
- **P1** = must be explicitly **Ship** or **Defer** in scope freeze (do not assume)
