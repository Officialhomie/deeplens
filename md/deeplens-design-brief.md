# DeepLens — UI/UX Design Brief
**Version:** 1.0  
**Status:** Draft  
**Author:** 0xVerse / eth-content-architect  
**Linked docs:** [PRD v1.0](./deeplens-prd.md) · [TRD v1.0](./deeplens-trd.md) · [App Flow](../deeplens-app-flow.html)  
**Date:** May 2026  

---

## 1. Design North Star

### 1.1 One sentence
DeepLens should feel like a **sharp, invisible research partner** — present when you need depth, gone when you don't.

### 1.2 Design principles

| Principle | What it means in UI |
|-----------|---------------------|
| **Flow over chrome** | The tooltip never covers the line you're reading. No modals, no full-page takeovers. |
| **Depth without noise** | Structured content (headers, lists, links) but zero decorative fluff. Every pixel earns its place. |
| **Adaptive, not assertive** | Tooltip matches the host page's light/dark context. The extension popup uses DeepLens brand, but stays compact. |
| **Instant feedback** | Skeleton → stream → done. No blocking spinners. Motion is subtle (150ms fades, blinking cursor). |
| **Trust through clarity** | API key handling, privacy, and errors are plain-spoken — never hidden, never alarming unless necessary. |

### 1.3 What DeepLens is *not*
- Not a dictionary popup (no single-line definitions as the whole experience)
- NotFounder-aesthetic glassmorphism or heavy gradients on the in-page tooltip
- Not a sidebar that steals horizontal space
- Not emoji-heavy or chatbot-cute (icons are functional, not decorative)

---

## 2. Brand Identity

### 2.1 Logo mark
- **Mark:** Rounded square (10px radius), 36×36px in docs; 20×20px in popup header
- **Fill:** Linear gradient 135° — `#5B5DFF` → `#00D4AA`
- **Letters:** `DL` in white, weight 800, tight letter-spacing
- **Wordmark:** `Deep` (white) + `Lens` (accent `#8B8DFF`)

### 2.2 Brand personality
- **Tone:** Direct, senior, confident — like a sharp engineer explaining to a smart peer
- **Energy:** Calm intelligence, not hype. Fast but not frantic.
- **Audience fit:** Researchers, learners, and skimmers who value time and clarity

### 2.3 Voice in UI copy
- Short labels: "Thinking…", "Streaming…", "Done"
- Errors are actionable: "Invalid API key. Check settings →"
- No filler: never "Great question!", "Sure!", or "Oops!"
- Privacy is explicit: "Your key is stored locally only."

---

## 3. Color System

DeepLens uses **two color contexts**: brand surfaces (popup, onboarding, marketing) and **adaptive tooltip surfaces** (injected on any webpage).

### 3.1 Brand palette (popup, onboarding, docs)

| Token | Hex | Usage |
|-------|-----|-------|
| `--ink` | `#0A0A0F` | Primary background |
| `--ink2` | `#1C1C28` | Elevated surfaces |
| `--ink3` | `#2E2E42` | Nested panels |
| `--surface` | `#13131F` | Popup header |
| `--surface2` | `#1A1A2E` | Popup body |
| `--surface3` | `#202035` | Tooltip mockup headers in docs |
| `--card` | `#16162A` | Cards, settings sections |
| `--card2` | `#1E1E36` | Nested cards |
| `--text-primary` | `#E2E2F0` | Body text on dark |
| `--text-muted` | `#6B6B85` | Secondary copy |
| `--text-muted2` | `#9898B0` | Labels, meta |
| `--accent` | `#5B5DFF` | Primary actions, active states |
| `--accent2` | `#8B8DFF` | Links, highlights, wordmark |
| `--accent-glow` | `rgba(91,93,255,0.25)` | Active pill backgrounds |
| `--teal` | `#00D4AA` | Success, Links mode accent |
| `--amber` | `#F5A623` | Quick mode accent, loading state |
| `--coral` | `#FF6B6B` | Errors, warnings |
| `--green` | `#4ADE80` | Done, positive confirmation |
| `--line` | `rgba(255,255,255,0.07)` | Dividers |
| `--line2` | `rgba(255,255,255,0.12)` | Borders |

**Mode accent mapping (for mode toggles and badges):**

| Mode | Accent | Dim background |
|------|--------|----------------|
| Quick | `--amber` | `rgba(245,166,35,0.12)` |
| Deep | `--accent2` | `rgba(91,93,255,0.20)` |
| Links | `--teal` | `rgba(0,212,170,0.15)` |

### 3.2 Tooltip palette — Light theme

Used when OS/page context is light. Defined in Shadow DOM.

| Token | Value |
|-------|-------|
| Background | `#FFFFFF` |
| Border | `1px solid rgba(0,0,0,0.10)` |
| Text primary | `#111111` |
| Text secondary | `#555555` |
| Section headers (`strong`) | `#111`, uppercase, 12px, letter-spacing 0.5px, opacity 0.7 |
| Links | `#4F8EF7` |
| Divider | `rgba(128,128,128,0.15)` |
| Shadow | `0 8px 32px rgba(0,0,0,0.18)` |
| Mode btn inactive | opacity 0.6 |
| Mode btn active bg | `rgba(128,128,128,0.12)` |

### 3.3 Tooltip palette — Dark theme

Used when `prefers-color-scheme: dark` or page background luminance < 0.4.

| Token | Value |
|-------|-------|
| Background | `#1E1E1E` |
| Border | `1px solid rgba(255,255,255,0.12)` |
| Text primary | `#E8E8E8` |
| Text secondary | `#9898B0` |
| Section headers | `#FFFFFF`, same sizing as light |
| Links | `#8B8DFF` |
| Divider | `rgba(128,128,128,0.15)` |
| Shadow | `0 8px 32px rgba(0,0,0,0.45)` |
| Mode btn active bg | `rgba(91,93,255,0.20)` |
| Mode btn active border | `rgba(91,93,255,0.40)` |

### 3.4 Semantic colors (both contexts)

| State | Color | Dot / indicator |
|-------|-------|-----------------|
| Idle | `--muted2` | Static gray |
| Loading | `--amber` | Soft glow |
| Streaming | `--accent2` | Pulse glow |
| Done | `--teal` | Soft glow |
| Error | `--coral` | Soft glow |
| Aborted | `--muted2` | 50% opacity |

---

## 4. Typography

### 4.1 Font roles

| Context | Primary | Secondary | Accent |
|---------|---------|-----------|--------|
| **Brand / popup / docs** | Syne | DM Mono | Instrument Serif (italic emphasis only) |
| **In-page tooltip** | System UI stack | DM Mono (footer status only) | — |

**Brand stack:**
```css
font-family: 'Syne', sans-serif;           /* UI, headings, buttons */
font-family: 'DM Mono', monospace;           /* Labels, meta, status, tags */
font-family: 'Instrument Serif', serif;    /* Hero emphasis — docs/marketing only */
```

**Tooltip stack (Shadow DOM — must not load external fonts):**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### 4.2 Type scale

| Element | Font | Size | Weight | Notes |
|---------|------|------|--------|-------|
| Popup title | Syne | 13px | 600 | "DeepLens" |
| Popup section label | DM Mono | 11px | 400 | UPPERCASE, letter-spacing 0.3px |
| Popup body / inputs | System / Syne | 12px | 400 | |
| Tooltip word (header) | System | 13px | 600 | Truncate with ellipsis |
| Tooltip body | System | 13px | 400 | line-height 1.65 |
| Tooltip section header | System | 12px | 600 | UPPERCASE in rendered markdown |
| Tooltip footer status | DM Mono | 10–11px | 400 | opacity 0.5 |
| Mode buttons | System | 10–11px | 400 | Segmented pill |
| Onboarding step title | Syne | 13px | 600 | |
| Docs page H1 | Syne | 36–56px | 800 | letter-spacing -2px |

### 4.3 Content typography rules (AI output inside tooltip)

- **Deep mode sections** render as bold labels → body paragraph. Labels are visually distinct (smaller, uppercase, muted).
- **Quick mode** is a single prose block — no headers, no lists.
- **Links mode** uses linked titles as primary affordance; descriptions are 12px secondary text.
- **Streaming cursor:** `▌` character, 1s blink, accent color — hidden when `done`.

---

## 5. Spacing, Radius, and Elevation

### 5.1 Spacing scale (4px base)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight gaps (mode buttons) |
| `--space-2` | 8px | Header icon gaps |
| `--space-3` | 12px | Tooltip margin from cursor |
| `--space-4` | 14px | Tooltip horizontal padding |
| `--space-5` | 16px | Popup padding |
| `--space-6` | 20px | Card padding |
| `--space-7` | 24px | Section spacing |

### 5.2 Border radius

| Token | Value | Usage |
|-------|-------|-------|
| `--r-sm` | 6px | Mode buttons, small pills |
| `--r-md` | 10px | Logo mark, cards |
| `--r-lg` | 12px | Tooltip, popup container |
| `--r-xl` | 16px | Doc cards |
| `--r-pill` | 20px | Nav pills, badges |

### 5.3 Shadows and elevation

| Level | Value | Usage |
|-------|-------|-------|
| Tooltip | `0 8px 32px rgba(0,0,0,0.18)` light / `0.45` dark | Floating panel |
| Popup | `0 4px 24px rgba(0,0,0,0.35)` | Extension popup |
| Hover lift | `translateY(-2px)` + border accent | Doc cards only |
| Pin panel | Slides from right edge, fixed position | Expanded tooltip |

### 5.4 Motion

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Tooltip appear | 150ms | ease |
| Tooltip dismiss | 150ms fade | ease |
| Hover fade after mouse leave | 1500ms delay, then 150ms fade | ease |
| Skeleton pulse | 1.5s | ease-in-out infinite |
| Stream cursor blink | 1s | step-end infinite |
| Toggle switch | 200ms | ease |
| Pin expand width | 200ms | ease |

**Rule:** No bouncy or playful animations. Motion confirms state, never entertains.

---

## 6. Component Library

### 6.1 Tooltip (primary surface)

**Dimensions:**
- Default: 380px wide, max-height 440px
- Pinned: 480px wide, max-height 600px
- Body scroll: max-height 340px (default) / 520px (pinned)

**Anatomy:**
```
┌─────────────────────────────────────────────┐
│ [word]     [Quick][Deep][Links]   📌 ⎘ ✕   │  ← header
├─────────────────────────────────────────────┤
│                                             │
│  WHAT IT IS                                 │  ← streamed markdown body
│  Body text streams here…▌                   │
│                                             │
├─────────────────────────────────────────────┤
│ ✦ Streaming…                                │  ← footer status
└─────────────────────────────────────────────┘
```

**Header:**
- Left: selected word/phrase (truncated)
- Center-right: mode segmented control (3 pills)
- Far right: Pin, Copy, Close icon buttons (11px, 30% opacity idle → 100% hover)

**Mode toggle:**
- Inactive: transparent bg, 1px border `rgba(128,128,128,0.25)`, opacity 0.6
- Active: tinted bg per mode accent, full opacity
- Abbreviated on narrow tooltips: Q / D / L

**Footer status strings:**
- `⏳ Thinking…` — loading, no tokens yet
- `✦ Streaming…` — tokens arriving
- `✓ Done` — complete (optional: word/sec stat)
- Error-specific copy replaces status

### 6.2 Extension popup (320×auto typical)

**Anatomy:**
```
┌──────────────────────────────┐
│ [DL] DeepLens        Active ◉│  ← header + global toggle
├──────────────────────────────┤
│ ANTHROPIC API KEY            │
│ [sk-ant-••••••••••••••••]   │
│                              │
│ DEFAULT MODE                 │
│ [ Quick | Deep | Links ]     │  ← segmented control
│                              │
│ HOVER DELAY                  │
│ ────●──────────  300ms       │  ← slider
│                              │
│ TRIGGER METHOD               │
│ [ Hover | Select ]           │
├──────────────────────────────┤
│ Privacy note (1 line)        │
└──────────────────────────────┘
```

**Popup width:** 320px fixed (Chrome extension popup convention)  
**Background:** `--surface2` with `--surface` header strip

### 6.3 Segmented control

Used for: Default mode, Trigger method (Hover / Select)

- Container: 1px border `--line2`, 8px radius, overflow hidden
- Segment: equal flex, 11px text, 6px vertical padding
- Active segment: `--accent-glow` background, `--accent2` text
- Inactive: `--muted2` text

### 6.4 Toggle switch (global on/off)

- Track: 32×18px, radius 9px
- On: `--accent` fill; thumb right
- Off: `--muted2` fill; thumb left
- Label: "Active" / "Inactive", 11px, right of toggle

### 6.5 Text input (API key)

- Full width, 7px radius
- Background: `rgba(255,255,255,0.04)` on dark popup
- Border: `--line2`
- Font: DM Mono 12px (monospace for keys)
- Placeholder: italic, `--muted2`
- Masked display: `sk-ant-••••••••••••••••••••`

### 6.6 Slider (hover delay)

- Track: 3px height, `--line2`
- Fill + thumb: `--accent`
- Thumb: 12px circle, white, 2px accent ring
- Value label: DM Mono 11px, `--accent2`, right-aligned (e.g. "300ms")
- Range: 200ms – 800ms

### 6.7 Buttons

| Variant | Style | Usage |
|---------|-------|-------|
| Primary | `--accent` bg, white text, 7px radius, 12px semibold | "Activate", "Save" |
| Secondary | `--teal-dim` bg, `--teal` text, 1px teal border | "Use Hosted" |
| Ghost / link | `--accent2` text, DM Mono 11px | Error recovery actions |
| Icon | No bg, 11px, opacity 0.3 → 1.0 on hover | Pin, Copy, Close |

### 6.8 Alert banner (first-run, no API key)

- Background: `rgba(255,107,107,0.08)`
- Border: `1px solid rgba(255,107,107,0.20)`
- Radius: 8px
- Title: 12px semibold `--coral`
- Body: 11px `--muted`

### 6.9 Skeleton loader (tooltip loading state)

- 3 horizontal bars, 10px height, 4px radius
- Fill: `rgba(255,255,255,0.06)` dark / `rgba(0,0,0,0.06)` light
- Staggered pulse animation (0, 0.15s, 0.3s delay)
- Widths: 90%, 75%, 85%

### 6.10 Error card (inside tooltip body)

- Replaces stream area — no modal
- Icon: ⚠ in `--coral`
- Message: 13px semibold
- Sub: 12px `--muted`
- Action: ghost link button ("Open settings →", "Retry in 30s", "Tap to retry")

### 6.11 Tags / badges (docs and debug)

- Font: DM Mono 10px, letter-spacing 0.5px
- P0: coral tint · P1: amber tint · P2: green tint

---

## 7. Screen Specifications

### 7.1 Screen map (v1.0)

| # | Screen | Type | Trigger |
|---|--------|------|---------|
| S1 | In-page tooltip — Loading | Overlay | Hover / select |
| S2 | In-page tooltip — Streaming | Overlay | First token |
| S3 | In-page tooltip — Complete | Overlay | Stream done |
| S4 | In-page tooltip — Pinned / Expanded | Overlay | Pin click |
| S5 | In-page tooltip — Error | Overlay | API / network fail |
| S6 | Extension popup — Configured | Popup | Toolbar icon click |
| S7 | Extension popup — First-run (no key) | Popup | Install / no key |
| S8 | Onboarding walkthrough (3 steps) | Inline in popup | First install |
| S9 | Browser toolbar — Active / Inactive | Icon state | Global toggle |

There is **no options page, no dashboard, no full-page app** in v1.0. The product lives entirely in the tooltip and popup.

---

### 7.2 S1 — Tooltip: Loading

**Purpose:** Confirm trigger registered; set expectation before first token.

**Layout:**
- Header fully rendered with word + mode tabs + actions
- Body: skeleton bars (not a spinner)
- Footer: `⏳ Thinking…`

**Behavior:**
- Appears within 50ms of trigger
- Positioned 12px below cursor/selection; auto-flips at viewport edges
- If user leaves before first token → silent abort, no error UI

**Visual note:** Header is interactive immediately (mode switch, close). Body is placeholder only.

---

### 7.3 S2 — Tooltip: Streaming

**Purpose:** Deliver AI response incrementally without blocking reading.

**Layout:**
- Same header; active mode highlighted
- Body: markdown rendering live — bold section headers appear as tokens arrive
- Blinking cursor at end of stream
- Footer: `✦ Streaming…`

**Deep mode structure (visual rhythm):**
```
WHAT IT IS          ← uppercase label, 12px, muted
Paragraph text…

MENTAL MODEL
Paragraph text…▌

WHY IT MATTERS HERE
…
```

**Quick mode:** Single flowing paragraph, no section breaks.

**Links mode:** Linked titles stack vertically with 4px gap; descriptions in secondary color.

---

### 7.4 S3 — Tooltip: Complete

**Purpose:** Full response readable; actions available.

**Changes from streaming:**
- Cursor hidden
- Footer: `✓ Done` (optional throughput stat for polish)
- Copy button copies full markdown/text
- Pin available
- Scrollable if content exceeds max-height

**Dismiss paths:** Escape, click outside, Close (✕), mouse leave + 1.5s fade (unless pinned)

---

### 7.5 S4 — Tooltip: Pinned / Expanded

**Purpose:** Lock panel for longer reading, copy, or link opening.

**Layout changes:**
- Width → 480px
- Max-height → 600px
- Slides to **right edge of viewport**, fixed position
- Pin icon toggled to "pinned" state (filled or accent color)
- Stays open when mouse moves away
- Dismiss **only** via Close (✕) or Escape

**Visual:** Slightly stronger shadow to signal "docked" state. Optional 1px accent left border (`--accent`) to distinguish from floating tooltip.

---

### 7.6 S5 — Tooltip: Error

**Purpose:** Explain failure and offer one clear recovery action.

**Variants:**

| Code | Message | Action |
|------|---------|--------|
| NO_API_KEY | No API key configured | Open settings |
| INVALID_KEY | Invalid API key | Check key in settings |
| RATE_LIMIT | Too many requests | Countdown → auto-retry |
| API_OVERLOADED | AI is busy right now | Retry (auto 3s) |
| NETWORK_ERROR | No connection | Check connection (text only) |
| SW_TERMINATED | Connection lost mid-stream | Tap to retry |

**Visual:** Error content replaces body area. Header remains (word + close). Footer shows error tag in DM Mono (e.g. `INVALID_KEY`) in coral tint.

**Rule:** ABORTED state shows **nothing** — tooltip destroys silently.

---

### 7.7 S6 — Popup: Configured (default)

**Purpose:** Settings hub for power users; status at a glance.

**Sections (top to bottom):**
1. Header — logo, name, global Active toggle
2. API key field (masked)
3. Default mode segmented control
4. Hover delay slider
5. Trigger method toggles (Hover / Select — both can be on)
6. Footer privacy line: "Your text is sent to Anthropic's API to generate responses."

**Optional v1.1 rows (design reserved):**
- Domain blacklist (text input + chip list)
- Keyboard shortcut config
- Output language dropdown

**States:**
- Saving key → inline spinner on "Activate" button
- Key valid → subtle green check, toggle enables
- Key invalid → coral inline error under field

---

### 7.8 S7 — Popup: First-run (no API key)

**Purpose:** Activate extension within 5 minutes of install.

**Differences from S6:**
- Toggle shows **Inactive** (off state)
- Coral alert banner at top
- Empty API key field with placeholder `Paste sk-ant-api-key here`
- Two CTAs side by side: **Activate** (primary) | **Use Hosted** (secondary, v1.1)
- Helper link: "Get a key at console.anthropic.com"

**After successful activation →** transitions to S8 onboarding, then S6.

---

### 7.9 S8 — Onboarding walkthrough

**Purpose:** 3-step inline guide inside popup (not a separate page).

**Steps:**

| Step | Title | Content |
|------|-------|---------|
| 1 | Hover to discover | Animated/GIF hint: pause on any word 300ms |
| 2 | Pick your mode | Explain Quick / Deep / Links with mode color accents |
| 3 | Keyboard shortcut | Show Alt+D on selected text; link to customize |

**Visual:**
- Numbered circles (28px) with mode-colored borders
- Horizontal 3-column layout in popup (stacks vertically if needed)
- Final step: "You're ready" + dismiss → S6

**Rule:** Skippable. Never blocks browsing.

---

### 7.10 S9 — Toolbar icon states

| State | Visual |
|-------|--------|
| Active + key set | Full-color icon (gradient mark) |
| Inactive / no key | Desaturated or badge dot (coral, 6px) |
| Streaming (optional v1.1) | Subtle pulse on icon |

Icon sizes: 16px toolbar, 48px management, 128px store listing.

---

## 8. Interaction Patterns

### 8.1 Trigger → response flow (visual timeline)

```
t=0ms      User pauses on word
t=300ms    Tooltip skeleton fades in (150ms)
t=310ms    Context extracted (invisible)
t=360ms    Header rendered
t=800ms    First token — skeleton replaced by text
t=3–6s     Stream completes — cursor hides, "Done"
```

### 8.2 Mode switch mid-stream

1. User taps different mode pill
2. Body clears immediately
3. Footer → `⏳ Thinking…`
4. New stream begins (same word, new prompt)
5. No page flicker; header word unchanged

### 8.3 Positioning rules (visual)

```
Default:     cursor/selection
             ↓ 12px
             [ tooltip ]

Bottom overflow → flip above
Right overflow  → shift left, min 12px viewport margin
Pinned          → dock right, full height scroll
Narrow viewport (<400px) → full-width bar at bottom
```

### 8.4 Dark mode detection (priority)

1. `prefers-color-scheme: dark` → dark tooltip
2. Else: sample `document.body` background luminance
3. Luminance < 0.4 → dark; else light
4. Set `data-theme="light|dark"` on `.dl-tooltip`

---

## 9. Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Keyboard dismiss | Escape closes tooltip |
| Focus trap | None — tooltip is non-modal; don't trap focus |
| Screen readers | Host element `aria-hidden="true"` (tooltip is enhancement, not primary content) |
| Icon buttons | `aria-label`: "Pin tooltip", "Copy response", "Close" |
| Color contrast | Body text ≥ 4.5:1 on both themes |
| Motion | Respect `prefers-reduced-motion`: disable pulse, blink, slide |
| Touch | Not v1.0 target; selection trigger works on touch via long-press future |

---

## 10. Responsive and Edge Cases

| Scenario | Design response |
|----------|-----------------|
| Viewport < 400px | Tooltip spans full width minus 24px margin; anchors bottom |
| Long selected phrase | Header truncates with ellipsis; full text in tooltip title tooltip (title attr) |
| Very long AI response | Body scrolls; header + footer sticky within tooltip |
| Host page dark + light article | Theme follows page body, not article column (known limitation v1.0) |
| Strict CSP pages | Inline CSS fallback in Shadow DOM — visual unchanged |
| GitHub / code-heavy pages | Tooltip uses same styles; code terms readable but no syntax highlighting |

---

## 11. Design Tokens (CSS Custom Properties)

Implement as a single `tokens.css` consumed by popup and injected into Shadow DOM.

```css
:root {
  /* Brand */
  --dl-ink: #0a0a0f;
  --dl-accent: #5b5dff;
  --dl-accent-soft: #8b8dff;
  --dl-teal: #00d4aa;
  --dl-amber: #f5a623;
  --dl-coral: #ff6b6b;
  --dl-green: #4ade80;

  /* Tooltip — light */
  --dl-tooltip-bg-light: #ffffff;
  --dl-tooltip-text-light: #111111;
  --dl-tooltip-link-light: #4f8ef7;

  /* Tooltip — dark */
  --dl-tooltip-bg-dark: #1e1e1e;
  --dl-tooltip-text-dark: #e8e8e8;
  --dl-tooltip-link-dark: #8b8dff;

  /* Shared */
  --dl-radius: 12px;
  --dl-radius-sm: 6px;
  --dl-shadow: 0 8px 32px rgba(0,0,0,0.18);
  --dl-font-ui: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --dl-font-mono: 'DM Mono', 'SF Mono', monospace;
  --dl-font-brand: 'Syne', sans-serif;

  /* Motion */
  --dl-duration-fast: 150ms;
  --dl-duration-fade: 1500ms;
  --dl-ease: ease;
}
```

---

## 12. Asset Checklist

| Asset | Spec |
|-------|------|
| `icon16.png` | Gradient mark, legible at 16px |
| `icon48.png` | Store / extensions page |
| `icon128.png` | Chrome Web Store listing |
| `tooltip.css` | < 5KB gzipped, Shadow DOM scoped |
| `popup.css` | Brand fonts loaded via extension page (Google Fonts OK in popup) |
| Onboarding GIF (optional) | 240×120px, hover demo loop |

---

## 13. v1.0 vs Future UI

| Feature | v1.0 | v1.5+ |
|---------|------|-------|
| Note saving | — | Pin panel + "Save" action |
| Domain blacklist UI | Spec only | Chip input in popup |
| Hosted API | Button stub | Account flow, usage meter |
| Options page | — | Full settings page if popup overflows |
| Mobile | — | Long-press trigger, bottom sheet tooltip |

---

## 14. Design QA Checklist

Before ship, verify visually on:

- [ ] Light blog (Medium, Substack) — tooltip light theme
- [ ] Dark docs (GitHub dark mode) — tooltip dark theme
- [ ] Long Deep mode response — scroll, section headers, links
- [ ] Quick mode — single paragraph, no structural noise
- [ ] Links mode — 4 links, readable descriptions
- [ ] Error: no API key — banner + CTA in popup and tooltip
- [ ] Pin mode — docks right, survives mouse movement
- [ ] Popup at 320px width — no overflow, readable labels
- [ ] First-run onboarding — completable in < 60 seconds
- [ ] `prefers-reduced-motion` — no blink/pulse

---

*DeepLens UI/UX Design Brief v1.0 — 0xVerse / eth-content-architect*  
*Cross-reference: [PRD](./deeplens-prd.md) · [TRD](./deeplens-trd.md) · [App Flow](../deeplens-app-flow.html)*
