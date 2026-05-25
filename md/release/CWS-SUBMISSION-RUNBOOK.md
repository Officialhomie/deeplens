# Chrome Web Store Submission Runbook — v1.0.0

**Package (upload this):** `/Users/mac/DEEPLENS/extension/release/deeplens-1.0.0.zip`  
**Dashboard:** https://chrome.google.com/webstore/devconsole  
**Paste copy:** `md/release/store-listing-cws-paste.md`

Legend: **🤖 Done in repo/CI** · **👤 You — required to continue** · **✅ Check when done**

---

## Phase A — Automated (already run)

| Step | Status | Notes |
|------|--------|-------|
| `npm run build` | 🤖 | Fresh dist |
| `npm run zip` | 🤖 | `extension/release/deeplens-1.0.0.zip` (~30 KB) |
| `npm run test:unit` | 🤖 | 79/79 |
| `npm run test:e2e` | 🤖 | See latest run below |
| Privacy URL live | 🤖 | https://officialhomie.github.io/deeplens/privacy/ |
| Screenshots on disk | 🤖 | `docs/store-assets/captured/*.png` (5 files) |

---

## Phase B — Smoke test on Chrome stable 👤 **YOU**

> The agent cannot load your unpacked extension into *your* Chrome profile. Do this once (~5 min).

1. **👤** Open **Google Chrome** (stable, not Canary) — not Cursor’s built-in browser.
2. **👤** `cd extension && npm run build` then `chrome://extensions` → **Developer mode** → **Load unpacked** → **`extension/dist`** only.
3. **👤** Click the DeepLens icon → paste a valid **Anthropic API key** (`sk-ant-…`) → **Activate** → finish onboarding → **Active** ON.
4. **👤** **Reload the tab** (required after first install).
5. **👤** Open test page: https://officialhomie.github.io/deeplens/test/ — hover **eigenvalue** ~400ms (not the Privacy/GitHub links on the home page).
6. **👤** Or use Wikipedia / Medium. Tooltip should stream or show a clear API error.

Troubleshooting: `md/release/DEV-TESTING.md` — the marketing home page alone does **not** run the extension.
6. **👤** Select a phrase → tooltip at selection.
7. **👤** Press **Escape** → tooltip dismisses.
8. **👤** Open popup → change a setting → reload extension/page → setting persists.

**When done:** Reply or tick **Smoke test** in `md/evidence/manual-cross-site-matrix.md` sign-off.

---

## Phase C — Manual cross-site matrix 👤 **YOU** (~20–30 min)

File: `md/evidence/manual-cross-site-matrix.md`

For each site, with unpacked `dist` loaded:

| Site | What to verify | Owner |
|------|----------------|-------|
| github.com | Hover + stream on README/code page | 👤 |
| medium.com | Long article hover | 👤 |
| x.com | SPA — hover if readable text | 👤 |
| notion.so | **No trigger** (blacklisted) | 👤 |
| mail.google.com | **No trigger** (blacklisted) | 👤 |
| arxiv.org | Academic paragraph hover | 👤 |
| docs.anthropic.com | Docs hover | 👤 |
| Dark-mode page | Tooltip readable | 👤 |
| Strict CSP | 🤖 covered by E2E fixture | 🤖 |

Tick `[x]` in the matrix file when each passes.

---

## Phase D — CWS Developer Dashboard 👤 **YOU** (login required)

### D1. Create / open listing

1. **👤** Log in: https://chrome.google.com/webstore/devconsole  
2. **👤** **New item** (or open existing draft) → upload package:

   ```
   /Users/mac/DEEPLENS/extension/release/deeplens-1.0.0.zip
   ```

3. **👤** Wait for package analysis to finish (no critical errors).

### D2. Store listing tab

Copy from `md/release/store-listing-cws-paste.md`:

| Field | Value | Owner |
|-------|-------|-------|
| **Name** | `DeepLens` | 👤 paste |
| **Short description** | 131-char version in paste file | 👤 paste |
| **Description** | Full block under “Detailed description” | 👤 paste |
| **Category** | `Productivity` | 👤 select |
| **Language** | `English` | 👤 select |
| **Privacy policy** | `https://officialhomie.github.io/deeplens/privacy/` | 👤 paste |
| **Homepage** (optional) | `https://officialhomie.github.io/deeplens/` | 👤 paste |
| **Support email** | **👤 YOUR email** (CWS account contact) | 👤 **you must type** |
| **Screenshots** | Upload all 5 from `docs/store-assets/captured/` | 👤 upload |

Screenshot files (in order):

1. `01-hover-streaming.png`
2. `02-popup-settings.png`
3. `03-deep-pinned.png`
4. `04-onboarding.png`
5. `05-popup-live.png`

### D3. Privacy practices / Data use 👤

**👤** Answer Google's questionnaire honestly:

- Collects: user-provided API key (local), page text sent to Anthropic when user triggers lookup
- No DeepLens backend in v1.0
- Link privacy policy URL above

### D4. Permission justifications 👤 (if form appears)

Paste or paraphrase from paste file § “Permission justification”:

| Permission | Justification |
|------------|---------------|
| `storage` | Persist API key and user preferences locally on device |
| `activeTab` | Run features on the current tab when the user invokes the extension |
| `scripting` | MV3 content script injection architecture |
| `https://api.anthropic.com/*` | Stream Claude API responses for user-initiated lookups |

**Single-purpose** (if asked):

```
DeepLens provides on-page AI explanations of words and phrases while you browse, using the user’s own Anthropic API key.
```

### D5. Submit for review 👤

1. **👤** Resolve any dashboard warnings.  
2. **👤** Click **Submit for review**.  
3. **👤** Monitor email / dashboard for reviewer questions.

---

## Phase E — After submit (optional)

| Task | Owner |
|------|-------|
| Tag `v1.0.0` on GitHub when approved | 👤 |
| Update `md/checklists/cws-submission-checklist.md` checkboxes | 👤 or agent |

---

## Quick reference — what only you can do

1. **Anthropic API key** in popup (secret — never commit).  
2. **Chrome stable** manual smoke + cross-site matrix.  
3. **CWS login** + upload ZIP + paste fields + **support email**.  
4. **Submit** button in dev console.

Everything else (build, zip, tests, privacy hosting, screenshot files, copy text) is ready in the repo.
