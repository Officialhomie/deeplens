# DeepLens — Product Requirements Document
**Version:** 1.0  
**Status:** Draft  
**Author:** [Your Name] — 0xVerse / eth-content-architect  
**Date:** May 2026  

---

## 1. Product Overview

### 1.1 Product Name
**DeepLens** — AI-powered contextual intelligence layer for the web

### 1.2 One-Line Summary
A browser extension that intercepts any word or sentence the user pauses on, and delivers an AI-generated deep context panel — meaning, mental models, relevance, and linked sources — streamed inline without leaving the page.

### 1.3 Problem Statement
Modern knowledge workers, researchers, students, and developers spend significant cognitive energy context-switching: they encounter unfamiliar terms, jargon, or complex concepts while reading, stop to Google them, get lost in ten tabs, lose their reading flow, and return to the original article with no continuity.

Existing solutions (Google Dictionary extension, browser built-in "Look up", Wikipedia hover) are shallow — they deliver a one-line definition, no cognitive scaffolding, no mental models, and no contextual relevance to what the user was actually reading.

The gap is **depth with flow** — deep intelligence that does not break the reading experience.

### 1.4 Vision
DeepLens should feel like having a world-class research partner looking over your shoulder. Not a dictionary. Not a search engine. A thinking partner that understands what you are reading and enriches it in real time.

---

## 2. Target Users

### 2.1 Primary User Segments

**Segment A — The Deep Researcher**
- Profiles: academics, analysts, investigative journalists, DeFi/Web3 builders
- Behavior: heavy long-form reading, complex domain-specific content
- Pain: unfamiliar terminology, jargon density, need to validate understanding fast
- Value: they will pay for depth and accuracy over speed

**Segment B — The Continuous Learner**
- Profiles: developers upskilling, bootcamp students, self-taught engineers
- Behavior: reads documentation, tutorials, technical articles daily
- Pain: cognitive overload when a paragraph assumes prior knowledge they don't have
- Value: they want to keep up without stopping

**Segment C — The Professional Skimmer**
- Profiles: founders, executives, consultants reading industry news
- Behavior: fast reading, skimming for signal
- Pain: wants quick depth on terms without losing reading velocity
- Value: time is their scarcest resource

### 2.2 User Personas

**Persona 1 — Temi, 28, DeFi Developer, Lagos**
> "I'm reading Uniswap V4 docs and I keep hitting terms I half-understand. I need something that explains without taking me off the page."
- Uses: deep technical mode, copy-to-note integration
- Retention driver: concept anchors and analogies

**Persona 2 — Adaeze, 24, Data Analytics Student, Ibadan**
> "My lecturer uses so many statistical terms. I can't keep pausing to Google every one. I need something smarter than a definition."
- Uses: educational mode, simple language toggle
- Retention driver: "explain like I'm new" output style

**Persona 3 — Kunle, 35, Startup Founder, Abuja**
> "I read a lot of VC/market reports. I need quick context without depth. Just: what is this, why it matters, move on."
- Uses: quick mode, keyboard shortcut to dismiss
- Retention driver: speed and zero friction

---

## 3. Goals and Non-Goals

### 3.1 Goals (v1.0)
- Detect user reading intent via hover (300ms threshold) and text selection
- Extract word + sentence context from the page
- Generate AI response with structured cognitive scaffolding
- Stream response into a floating tooltip without page navigation
- Support three modes: Quick (definition), Deep (full cognitive context), Links (sources)
- Work on any webpage (news, docs, GitHub, Twitter/X, Substack, Medium, etc.)
- Respect user's reading flow — the extension must never feel intrusive

### 3.2 Non-Goals (v1.0 — deferred to later)
- Mobile browser support (Chrome Android) — deferred to v1.5
- Firefox/Safari support — v2.0
- Note-taking / saving panel — v1.5
- Team/shared context features — v2.0
- Fine-tuned domain-specific models (medical, legal, finance) — v2.0
- Offline mode — v2.0
- Full page summarization — v1.5

---

## 4. Feature Requirements

### 4.1 Core Detection Engine

| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F-01 | Hover detection | P0 | Detect when user holds mouse over a single word for ≥300ms |
| F-02 | Selection detection | P0 | Detect mouseup event on any selected text (word, phrase, sentence) |
| F-03 | Context extraction | P0 | Extract: selected word/phrase, surrounding sentence, paragraph heading (if available), page title, page URL |
| F-04 | Abort on leave | P0 | Cancel in-flight API request if user moves off word before response starts |
| F-05 | Debounce | P0 | Prevent API calls on fast mouse movement — only fire on intentional pause |
| F-06 | Exclusion zones | P1 | Do not trigger inside input fields, textareas, code editors, forms |
| F-07 | Domain blacklist | P1 | User can add sites where extension is disabled (banking, email, private tools) |

### 4.2 AI Response Engine

| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F-08 | Quick mode | P0 | 2–3 sentence explanation, plain language, no cognitive overhead |
| F-09 | Deep mode | P0 | Structured response: definition → mental model/analogy → contextual relevance → connections → links |
| F-10 | Links mode | P1 | 3–5 curated links with short descriptions. Use Claude web_search tool or pre-defined source tiers |
| F-11 | Streaming output | P0 | Render AI response token-by-token as it arrives. No loading spinner blocking screen |
| F-12 | Context-aware prompting | P0 | System prompt injects page title + domain category so AI adapts tone (technical vs educational vs general) |
| F-13 | Mode memory | P1 | Remember user's last selected mode per session |

### 4.3 Tooltip UI

| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F-14 | Floating tooltip | P0 | Appears near cursor, never covering current reading line |
| F-15 | Auto-position | P0 | Detect viewport edge, flip tooltip above/below cursor as needed |
| F-16 | Dismiss on Escape | P0 | Press Escape to close tooltip |
| F-17 | Click-away dismiss | P0 | Click anywhere outside tooltip to close |
| F-18 | Pin / expand | P1 | Pin button locks tooltip open and expands it to a wider deep panel |
| F-19 | Copy to clipboard | P1 | One-click copy of AI response |
| F-20 | Mode toggle in UI | P1 | Quick / Deep / Links toggle visible inside tooltip, swaps AI output without re-triggering |
| F-21 | Keyboard shortcut | P1 | User-configurable shortcut (default: Alt+D) to trigger deep mode on selected text |
| F-22 | Dark mode support | P0 | Tooltip auto-detects page dark/light theme and matches it |

### 4.4 Settings and Configuration

| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F-23 | Extension popup | P0 | Popup panel: API key input, default mode, hover delay, on/off toggle |
| F-24 | API key storage | P0 | Store API key securely in chrome.storage.local (encrypted, never exposed to page) |
| F-25 | Default mode selector | P1 | Set default to Quick / Deep / Links |
| F-26 | Hover delay config | P1 | Slider: 200ms – 800ms hover delay |
| F-27 | Language output | P2 | Option to receive AI response in user's preferred language |

---

## 5. AI Prompt Architecture

### 5.1 System Prompt — Deep Mode
```
You are DeepLens, a cognitive context engine. When given a word or phrase and its surrounding context, you provide structured intelligence to help the reader understand deeply without leaving the page.

Always respond in this exact format:

**What it is**
[2-3 sentence plain-language definition]

**Mental model**
[One powerful analogy or mental model that makes this concept stick]

**Why it matters here**
[1-2 sentences connecting it specifically to the reader's current context]

**Connections**
[2 related concepts worth knowing, as a short list]

**Go deeper**
[2-3 resource links: prefer primary sources, official docs, or high-signal articles]

Tone: direct, sharp, no fluff. Like a senior engineer explaining to a smart peer.
Max length: 350 words.
```

### 5.2 System Prompt — Quick Mode
```
You are DeepLens Quick. Given a word or phrase and its context, deliver a single crisp paragraph (3-4 sentences max) that explains:
1. What it is
2. Why it matters in this context

No lists, no headers, no links. Direct, confident, plain English.
```

### 5.3 System Prompt — Links Mode
```
You are DeepLens Links. Return exactly 4 resources related to the given word/phrase. For each:
- Title
- URL (real, authoritative)
- One-sentence description of what the user will find there

Source preference: official docs > academic papers > well-known technical blogs > community resources. Avoid SEO content farms.
```

### 5.4 Context Injection Template
```
Word / phrase: "{selected_text}"
Surrounding sentence: "{sentence_context}"
Page title: "{document_title}"
Domain: "{page_domain}"
```

---

## 6. Technical Architecture

### 6.1 Extension Structure
```
deeplens/
├── manifest.json           # MV3 manifest
├── background/
│   └── service-worker.js   # Message routing, settings access
├── content/
│   ├── detector.js         # Hover + selection detection
│   ├── extractor.js        # Context extraction from DOM
│   ├── tooltip.js          # Tooltip injection and positioning
│   └── streamer.js         # SSE stream → DOM renderer
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── api/
│   └── claude.js           # API call abstraction (direct or proxy)
├── styles/
│   └── tooltip.css         # Injected tooltip styles
└── utils/
    ├── debounce.js
    ├── storage.js
    └── position.js         # Viewport-aware tooltip positioning
```

### 6.2 Data Flow
```
User intent (hover/select)
  → Debounce filter (300ms)
    → Context extractor (word + sentence + page meta)
      → Prompt builder (injects context + mode)
        → API call (streaming, with abort signal)
          → SSE parser
            → Tooltip DOM renderer (streaming markdown)
```

### 6.3 API Integration
- **Model:** `claude-sonnet-4-20250514`
- **Max tokens:** 600 (Deep), 200 (Quick), 400 (Links)
- **Streaming:** Yes — Server-Sent Events (SSE)
- **Key storage:** `chrome.storage.local` — never injected into page context
- **Production:** Vercel Edge Function proxy recommended (hides key, adds rate limiting)

### 6.4 Performance Targets
| Metric | Target |
|--------|--------|
| Time to first token | < 800ms |
| Full Quick response | < 3s |
| Full Deep response | < 6s |
| Tooltip render lag | < 50ms |
| CPU impact on page | < 2% idle |
| Memory footprint | < 15MB |

---

## 7. User Experience Flows

### 7.1 Primary Flow — Hover
1. User is reading an article
2. Mouse pauses on the word "eigenvalue" for 300ms
3. Tooltip appears 12px below cursor — no click required
4. AI response streams in, word by word
5. User reads the mental model analogy, continues reading
6. Mouse leaves word → tooltip fades after 1.5s
7. Total disruption to reading flow: ~0

### 7.2 Primary Flow — Select
1. User selects the phrase "zero-knowledge proof"
2. Tooltip appears at end of selection
3. User clicks "Deep" mode button in tooltip
4. Full structured response streams in
5. User clicks Pin → panel locks and expands
6. User copies the response, continues reading

### 7.3 First-Run Flow
1. User installs extension from Chrome Web Store
2. Popup auto-opens → asks for API key (direct) or directs to hosted version
3. Brief 3-step onboarding: hover demo, mode selector, keyboard shortcut config
4. Extension activates immediately, no page reload needed

---

## 8. Success Metrics

### 8.1 Activation
| Metric | Target (30 days post-launch) |
|--------|------------------------------|
| Install to first tooltip trigger | < 5 minutes |
| Day 1 retention | > 60% |
| Day 7 retention | > 35% |
| Sessions per active user / week | > 8 |

### 8.2 Engagement
| Metric | Target |
|--------|--------|
| Avg tooltips triggered per session | > 5 |
| Deep mode usage rate | > 40% of triggers |
| Pin rate (tooltip expanded) | > 15% |
| Dismissal before stream completes | < 25% |

### 8.3 Quality
| Metric | Target |
|--------|--------|
| Time to first token | < 800ms (p95) |
| API error rate | < 1% |
| User-reported irrelevant responses | < 5% |

---

## 9. Risks and Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| API key exposed in extension | Critical | Store in `chrome.storage.local`, never injected into page. Proxy recommended for v1.1 |
| Tooltip triggers on fast mouse moves | High | 300ms debounce + abort on mouse leave |
| Content Security Policy blocks tooltip styles | Medium | Use Shadow DOM for tooltip to isolate styles from host page |
| AI response irrelevant to context | Medium | Strong context injection in prompt — word + sentence + page title + domain |
| Rate limits hit by power users | Medium | Token bucket per session in service worker, clear UX error state |
| Extension slows down heavy pages | Low | Content script is passive listener only — no DOM mutation until trigger |
| Chrome Web Store review rejection | Medium | Ensure clear privacy policy, no data retention, transparent API key handling |

---

## 10. Privacy and Security

- **No data stored on servers.** All processing is user's API key → Anthropic → user's browser.
- **API key:** stored locally in `chrome.storage.local`, never sent to any server except Anthropic (or user's own proxy).
- **No tracking.** No analytics by default in v1.0. Optional opt-in usage stats in v1.5.
- **Shadow DOM isolation.** Tooltip rendered in Shadow DOM to prevent style conflicts and prevent host page JS from reading tooltip content.
- **Content Security Policy.** Extension follows strict CSP — no eval, no inline scripts.
- **Data retention:** Zero. Each query is stateless. No query history stored.

---

## 11. Monetization (Post-MVP)

| Model | Description | Target Version |
|-------|-------------|----------------|
| **Bring Your Own Key (BYOK)** | Free, user provides Anthropic key | v1.0 |
| **Hosted API** | DeepLens hosts the backend, usage-based billing | v1.5 |
| **Pro Plan** | Unlimited queries + note-saving + domain modes + team share | v1.5 |
| **Enterprise** | Custom model fine-tuning, SSO, audit logs | v2.0 |

**Pricing anchor (Pro):** $9/month or $79/year — positioned as "the cost of one hour of your time per month."

---

## 12. Roadmap

### v1.0 — Core (8 weeks)
- Hover + selection detection
- Quick + Deep modes
- Streaming tooltip UI
- Extension popup with API key config
- Chrome Web Store submission

### v1.5 — Depth (12 weeks post v1.0)
- Links mode with web search
- Pin-to-panel with note saving
- Keyboard shortcuts
- Domain blacklist
- Hosted API option (proxy)

### v2.0 — Platform (6 months)
- Firefox + Edge support
- Domain-specific models (technical, medical, legal, finance)
- Team shared context library
- Mobile (Chrome Android)

---

## 13. Open Questions

1. **Trigger mechanism UX:** Should hover be opt-in and select be the default, to reduce accidental triggers on dense pages? Worth A/B testing at launch.
2. **Model selection:** claude-sonnet-4-6 is the default. Should power users be able to configure model (e.g. haiku for speed, opus for depth)?
3. **Web search in Links mode:** Build into Claude API call (web_search tool) or post-process with a separate search call? Trade-off: latency vs link quality.
4. **Internationalization:** Is English-only output acceptable for v1.0 given the African user base, or should Yoruba/Igbo/Hausa output be scoped early?
5. **Shadow DOM vs iframe:** Shadow DOM is cleaner but some page CSPs still block injected styles. Should we fall back to an iframe-based tooltip for hardened sites?

---

*DeepLens PRD v1.0 — Built by 0xVerse / eth-content-architect*
