# DeepLens — Technical Requirements Document (TRD)
**Version:** 1.0  
**Status:** Draft  
**Author:** [Your Name] — 0xVerse / eth-content-architect  
**Linked PRD:** DeepLens PRD v1.0  
**Date:** May 2026  

---

## Table of Contents

1. [Technical Overview](#1-technical-overview)
2. [System Architecture](#2-system-architecture)
3. [Extension Manifest and Permissions](#3-extension-manifest-and-permissions)
4. [Module Specifications](#4-module-specifications)
   - 4.1 Content Script — Detector
   - 4.2 Content Script — Context Extractor
   - 4.3 Content Script — Tooltip Engine
   - 4.4 Content Script — SSE Stream Renderer
   - 4.5 Service Worker — Background Logic
   - 4.6 API Module — Claude Integration
   - 4.7 Prompt Builder
   - 4.8 Storage Module
   - 4.9 Position Engine
   - 4.10 Shadow DOM Manager
5. [API Contract](#5-api-contract)
6. [Data Models](#6-data-models)
7. [State Management](#7-state-management)
8. [Security Architecture](#8-security-architecture)
9. [Performance Specifications](#9-performance-specifications)
10. [Error Handling and Resilience](#10-error-handling-and-resilience)
11. [Testing Requirements](#11-testing-requirements)
12. [Build and Deployment Pipeline](#12-build-and-deployment-pipeline)
13. [Proxy Server Specification (Optional v1.1)](#13-proxy-server-specification)
14. [Browser Compatibility and CSP Handling](#14-browser-compatibility-and-csp-handling)
15. [Technical Risks and Mitigations](#15-technical-risks-and-mitigations)

---

## 1. Technical Overview

### 1.1 What This Document Covers
This TRD defines every technical implementation decision for DeepLens v1.0. It translates PRD feature requirements into concrete module contracts, data schemas, API specifications, security constraints, and build requirements. Engineers should be able to build any module from this document without needing to reference the PRD.

### 1.2 Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Extension runtime | Chrome MV3 (Manifest Version 3) | Required for Chrome Web Store 2024+. No MV2. |
| Content script | Vanilla JavaScript (ES2022) | No framework — injected into arbitrary pages, must be minimal and isolated |
| Tooltip UI | Shadow DOM + CSS Custom Properties | Full style isolation from host page, CSP-safe |
| Background logic | Service Worker (MV3 native) | Replaces background pages in MV3 |
| Build tooling | Vite + CRXJS plugin | Fast HMR for extension dev, handles MV3 content script bundling |
| Language | TypeScript (strict mode) | Type safety across module boundaries |
| API | Anthropic Claude API (`claude-sonnet-4-20250514`) | Streaming support, best response quality at target latency |
| Streaming | Server-Sent Events (SSE) via `fetch` with `ReadableStream` | Native browser API, no socket library needed |
| Storage | `chrome.storage.local` | Persists across sessions, sync not used (API key is device-local) |
| Proxy (v1.1) | Vercel Edge Functions (Node.js runtime) | Sub-50ms cold start, global edge network, easy auth layer |
| Testing | Vitest (unit) + Playwright (E2E extension testing) | Vitest for module logic, Playwright for full extension flows |

### 1.3 Architectural Principles

- **Zero page footprint until triggered.** Content script registers event listeners only. No DOM mutation, no style injection, no iframe creation until user explicitly triggers a lookup.
- **Shadow DOM isolation is non-negotiable.** All tooltip HTML and CSS live in an attached shadow root. The host page cannot read, style, or interfere with the tooltip.
- **Abort-first design.** Every API call is wrapped in an `AbortController`. Any new trigger cancels the previous in-flight request before starting a new one.
- **Stateless requests.** No query history is persisted. Each lookup is independent. Session-level state (last mode used) is held in memory only.
- **API key never touches page context.** The key is read from `chrome.storage.local` inside the service worker, not the content script. Content script sends a message to the service worker which makes the API call.

---

## 2. System Architecture

### 2.1 Component Map

```
┌─────────────────────────────────────────────────────────────────┐
│  HOST PAGE (any URL)                                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CONTENT SCRIPT (isolated world)                        │  │
│  │                                                          │  │
│  │  detector.ts ──────► extractor.ts ──────► promptBuilder  │  │
│  │       │                                        │         │  │
│  │  [hover/select]                         [message send]   │  │
│  │                                                │         │  │
│  │  ◄─────────────────────────────────────────────         │  │
│  │  [streaming tokens via chrome.runtime.onMessage]        │  │
│  │       │                                                  │  │
│  │  streamer.ts ──────► tooltipEngine.ts                   │  │
│  │                           │                             │  │
│  │                    ┌──────▼──────┐                      │  │
│  │                    │ Shadow DOM  │                       │  │
│  │                    │  Tooltip   │                       │  │
│  │                    └────────────┘                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
              │ chrome.runtime.sendMessage
              ▼
┌─────────────────────────────────────────────────────────────────┐
│  SERVICE WORKER (background)                                    │
│                                                                 │
│  messageRouter.ts                                               │
│       │                                                         │
│  storage.ts (reads API key)                                     │
│       │                                                         │
│  claudeAPI.ts ──────► Anthropic API (SSE stream)               │
│       │                                                         │
│  Streams tokens back via chrome.runtime.sendMessage            │
└─────────────────────────────────────────────────────────────────┘
              │ (v1.1 optional)
              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PROXY SERVER (Vercel Edge)                                     │
│  /api/query ──► Anthropic API ──► SSE stream ──► service worker│
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Message Passing Contract

Chrome MV3 does not allow content scripts to make cross-origin fetch requests directly to `api.anthropic.com`. The service worker handles all API communication.

**Content Script → Service Worker:**
```typescript
chrome.runtime.sendMessage({
  type: 'DEEPLENS_QUERY',
  payload: QueryPayload
})
```

**Service Worker → Content Script (streaming tokens):**
```typescript
chrome.tabs.sendMessage(tabId, {
  type: 'DEEPLENS_TOKEN',
  token: string,
  done: boolean,
  error?: string
})
```

**Content Script → Service Worker (abort):**
```typescript
chrome.runtime.sendMessage({ type: 'DEEPLENS_ABORT' })
```

### 2.3 Execution Contexts

| Context | What runs there | Key constraints |
|---------|----------------|-----------------|
| Content script | detector, extractor, tooltip, streamer | Cannot call `chrome.storage` directly for secrets; cannot fetch cross-origin |
| Service worker | API calls, storage reads, message routing | No DOM access; may be terminated between messages; must be stateless |
| Popup | Settings UI, key input | Short-lived; runs only when popup is open |

---

## 3. Extension Manifest and Permissions

### 3.1 manifest.json (complete)

```json
{
  "manifest_version": 3,
  "name": "DeepLens",
  "version": "1.0.0",
  "description": "AI-powered contextual intelligence layer for the web",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png"
    }
  },
  "background": {
    "service_worker": "background/service-worker.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content/index.js"],
      "run_at": "document_idle",
      "all_frames": false
    }
  ],
  "permissions": [
    "storage",
    "activeTab",
    "scripting"
  ],
  "host_permissions": [
    "https://api.anthropic.com/*"
  ],
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  },
  "web_accessible_resources": [
    {
      "resources": ["styles/tooltip.css"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

### 3.2 Permission Justification

| Permission | Why needed | Scope |
|-----------|-----------|-------|
| `storage` | Read/write API key, settings, session mode | Local only — `chrome.storage.local` |
| `activeTab` | Send messages to the active tab's content script | Current tab only, when user triggers action |
| `scripting` | Programmatically inject content script if needed for SPA re-navigation | Active tab only |
| `host_permissions: api.anthropic.com` | Service worker must fetch to Anthropic's API | Outbound only, no page data sent without user trigger |

**Not requested (intentionally excluded):**
- `tabs` — not needed; `activeTab` covers message routing
- `history`, `bookmarks`, `cookies` — no access to user browsing data
- `<all_urls>` in host_permissions — only `api.anthropic.com` is a host permission; `<all_urls>` in `content_scripts.matches` is a content script match pattern (different security model)

---

## 4. Module Specifications

### 4.1 Content Script — Detector (`content/detector.ts`)

**Responsibility:** Listen for user intent events. Dispatch a `DeepLensQuery` event with extracted context when intent is confirmed. Does not touch the API or DOM (except to read word under cursor).

**Interfaces:**
```typescript
interface DetectorConfig {
  hoverDelayMs: number;       // default: 300
  selectionEnabled: boolean;  // default: true
  hoverEnabled: boolean;      // default: true
}

type TriggerMode = 'hover' | 'select';
```

**Hover detection logic:**
```typescript
// 1. On mouseover, read word at cursor using caretRangeFromPoint
// 2. Start timer (hoverDelayMs)
// 3. On mouseout or mousemove beyond 5px threshold, clear timer
// 4. If timer fires without interruption → dispatch intent

function getWordAtPoint(x: number, y: number): string | null {
  const range = document.caretRangeFromPoint(x, y);
  if (!range) return null;
  range.expand('word');
  const word = range.toString().trim();
  // Filter: reject if word is < 3 chars, is purely numeric, or contains no letters
  if (word.length < 3 || /^\d+$/.test(word) || !/[a-zA-Z]/.test(word)) return null;
  return word;
}
```

**Exclusion zones — do not trigger inside:**
```typescript
const EXCLUDED_TAGS = new Set([
  'INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A',
  'CODE', 'PRE'  // optional: allow code lookups in v1.1
]);

const EXCLUDED_ROLES = new Set([
  'textbox', 'searchbox', 'combobox', 'spinbutton'
]);

function isExcluded(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  if (EXCLUDED_TAGS.has(target.tagName)) return true;
  const role = target.getAttribute('role');
  if (role && EXCLUDED_ROLES.has(role)) return true;
  if (target.isContentEditable) return true;
  // Check closest editable ancestor
  return !!target.closest('[contenteditable="true"], [role="textbox"]');
}
```

**Selection detection logic:**
```typescript
document.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  const text = selection?.toString().trim();
  if (!text || text.length < 3 || text.length > 500) return;
  if (isExcluded(selection?.anchorNode?.parentElement)) return;
  const range = selection?.getRangeAt(0);
  const rect = range?.getBoundingClientRect();
  // Dispatch with cursor position at end of selection
  dispatchTrigger({ text, mode: 'select', rect });
});
```

---

### 4.2 Content Script — Context Extractor (`content/extractor.ts`)

**Responsibility:** Given a word/phrase and its position in the DOM, extract the richest possible context string to improve AI response quality.

**Output schema:**
```typescript
interface ExtractedContext {
  selectedText: string;
  sentenceContext: string;       // sentence(s) containing the word
  paragraphContext: string;      // up to 300 chars of surrounding paragraph
  headingContext: string | null; // nearest h1-h4 ancestor or sibling heading
  pageTitle: string;
  pageURL: string;
  pageDomain: string;
  domainCategory: DomainCategory;
}

type DomainCategory =
  | 'technical'   // github.com, docs.*, developer.*
  | 'academic'    // arxiv.org, scholar.google.com, jstor.org
  | 'news'        // known news domains
  | 'social'      // twitter.com, reddit.com, linkedin.com
  | 'general';    // everything else
```

**Sentence extraction algorithm:**
```typescript
function extractSentence(node: Node, targetWord: string): string {
  // Walk up DOM to find nearest block-level text container
  const container = node.closest('p, li, td, blockquote, article, section, div');
  const rawText = container?.textContent || document.body.innerText.slice(0, 2000);
  
  // Split on sentence boundaries
  const sentences = rawText.match(/[^.!?]*(?:[.!?]|$)/g) || [];
  
  // Find sentence containing the target word (case-insensitive)
  const match = sentences.find(s =>
    s.toLowerCase().includes(targetWord.toLowerCase())
  );
  
  // Return matched sentence or fallback to 200-char window around word
  if (match && match.trim().length > 10) return match.trim().slice(0, 300);
  
  const idx = rawText.toLowerCase().indexOf(targetWord.toLowerCase());
  if (idx === -1) return targetWord;
  const start = Math.max(0, idx - 100);
  const end = Math.min(rawText.length, idx + 100);
  return rawText.slice(start, end).trim();
}
```

**Domain category detection:**
```typescript
const DOMAIN_PATTERNS: Record<DomainCategory, RegExp> = {
  technical: /github\.com|stackoverflow\.com|docs\.|developer\.|mdn\.|npmjs|crates\.io/,
  academic:  /arxiv\.org|scholar\.google|jstor|pubmed|researchgate|semanticscholar/,
  news:      /cnn|bbc|techcrunch|theverge|wired|bloomberg|reuters|guardian/,
  social:    /twitter\.com|x\.com|reddit\.com|linkedin\.com|substack\.com/,
  general:   /.*/
};

function categorizeDomain(hostname: string): DomainCategory {
  for (const [cat, pattern] of Object.entries(DOMAIN_PATTERNS)) {
    if (pattern.test(hostname)) return cat as DomainCategory;
  }
  return 'general';
}
```

---

### 4.3 Content Script — Tooltip Engine (`content/tooltip.ts`)

**Responsibility:** Create, position, update, and destroy the floating tooltip. All UI lives inside a Shadow DOM root attached to a `<div id="deeplens-host">` appended to `document.body`.

**Shadow DOM setup:**
```typescript
let shadowRoot: ShadowRoot | null = null;

function ensureHost(): ShadowRoot {
  if (shadowRoot) return shadowRoot;
  
  const host = document.createElement('div');
  host.id = 'deeplens-host';
  host.style.cssText = 'all: initial; position: fixed; z-index: 2147483647;';
  document.body.appendChild(host);
  
  shadowRoot = host.attachShadow({ mode: 'closed' }); // closed: page JS cannot pierce
  
  // Inject tooltip stylesheet into shadow root
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = chrome.runtime.getURL('styles/tooltip.css');
  shadowRoot.appendChild(link);
  
  return shadowRoot;
}
```

**Tooltip HTML structure:**
```html
<div class="dl-tooltip" data-mode="deep" data-theme="light|dark">
  <div class="dl-header">
    <span class="dl-word"><!-- selected word --></span>
    <div class="dl-modes">
      <button class="dl-mode-btn" data-mode="quick">Quick</button>
      <button class="dl-mode-btn active" data-mode="deep">Deep</button>
      <button class="dl-mode-btn" data-mode="links">Links</button>
    </div>
    <button class="dl-pin" aria-label="Pin tooltip">📌</button>
    <button class="dl-copy" aria-label="Copy response">⎘</button>
    <button class="dl-close" aria-label="Close">✕</button>
  </div>
  <div class="dl-body">
    <div class="dl-stream"><!-- streamed markdown renders here --></div>
  </div>
  <div class="dl-footer">
    <span class="dl-status"><!-- "Thinking…" / "Done" / error --></span>
  </div>
</div>
```

**Positioning algorithm:**
```typescript
interface Position { top: number; left: number; }

function computePosition(
  triggerRect: DOMRect,
  tooltipWidth = 380,
  tooltipHeight = 280,
  mode: TriggerMode
): Position {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const MARGIN = 12;
  const SCROLL_X = window.scrollX;
  const SCROLL_Y = window.scrollY;

  // Horizontal: align to trigger left, flip if overflows right edge
  let left = triggerRect.left + SCROLL_X;
  if (left + tooltipWidth > vw + SCROLL_X - MARGIN) {
    left = Math.max(SCROLL_X + MARGIN, vw + SCROLL_X - tooltipWidth - MARGIN);
  }

  // Vertical: appear below trigger, flip above if overflows bottom
  let top = triggerRect.bottom + SCROLL_Y + MARGIN;
  if (top + tooltipHeight > vh + SCROLL_Y - MARGIN) {
    top = triggerRect.top + SCROLL_Y - tooltipHeight - MARGIN;
  }

  return { top, left };
}
```

**Dark mode detection:**
```typescript
function detectTheme(): 'dark' | 'light' {
  // Check OS preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  
  // Check page background color as fallback
  const bg = window.getComputedStyle(document.body).backgroundColor;
  const rgb = bg.match(/\d+/g)?.map(Number);
  if (rgb && rgb.length >= 3) {
    const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
    return luminance < 0.4 ? 'dark' : 'light';
  }
  return 'light';
}
```

**Dismiss logic:**
```typescript
// Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') destroyTooltip();
});

// Click outside shadow host
document.addEventListener('mousedown', (e) => {
  const host = document.getElementById('deeplens-host');
  if (host && !host.contains(e.target as Node)) destroyTooltip();
});
```

---

### 4.4 Content Script — SSE Stream Renderer (`content/streamer.ts`)

**Responsibility:** Receive token chunks from the service worker (via `chrome.runtime.onMessage`) and render them progressively into the tooltip's `.dl-stream` div using a lightweight markdown-to-HTML renderer.

**Token receiver:**
```typescript
chrome.runtime.onMessage.addListener((message) => {
  if (message.type !== 'DEEPLENS_TOKEN') return;
  
  if (message.error) {
    renderError(message.error);
    return;
  }
  
  if (message.token) {
    appendToken(message.token);
  }
  
  if (message.done) {
    finalizeRender();
  }
});
```

**Incremental markdown renderer:**
Rather than a full markdown library (too heavy for a content script), implement a targeted renderer for DeepLens's specific output format:

```typescript
// Supported markdown: **bold**, \n\n (paragraph), - (list item), [text](url)
// Rendered incrementally as tokens arrive

let buffer = '';

function appendToken(token: string): void {
  buffer += token;
  const streamEl = getStreamElement();
  if (!streamEl) return;
  // Re-render entire buffer on each token (acceptable for ≤600 tokens)
  streamEl.innerHTML = renderMarkdown(buffer);
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.*?)\]\((https?:\/\/[^\)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/, '<p>$1</p>');
}
```

---

### 4.5 Service Worker — Background Logic (`background/service-worker.ts`)

**Responsibility:** Receive query messages from content scripts, read the API key from storage, call the Claude API with streaming, and relay tokens back to the content script tab. Handle abort signals.

**Message router:**
```typescript
let currentAbortController: AbortController | null = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'DEEPLENS_QUERY') {
    handleQuery(message.payload, sender.tab!.id!);
    sendResponse({ ok: true });
  }
  
  if (message.type === 'DEEPLENS_ABORT') {
    currentAbortController?.abort();
    sendResponse({ ok: true });
  }
  
  return true; // keep message channel open for async
});
```

**Query handler:**
```typescript
async function handleQuery(payload: QueryPayload, tabId: number): Promise<void> {
  // Abort any in-flight request
  currentAbortController?.abort();
  currentAbortController = new AbortController();

  // Read API key
  const { apiKey } = await chrome.storage.local.get('apiKey');
  if (!apiKey) {
    chrome.tabs.sendMessage(tabId, {
      type: 'DEEPLENS_TOKEN',
      error: 'NO_API_KEY',
      done: true
    });
    return;
  }

  // Build request
  const request = buildClaudeRequest(payload);
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(request),
      signal: currentAbortController.signal
    });

    if (!response.ok) {
      const err = await response.json();
      chrome.tabs.sendMessage(tabId, {
        type: 'DEEPLENS_TOKEN',
        error: err.error?.type || 'API_ERROR',
        done: true
      });
      return;
    }

    // Read SSE stream
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

      for (const line of lines) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          chrome.tabs.sendMessage(tabId, { type: 'DEEPLENS_TOKEN', done: true });
          return;
        }
        try {
          const parsed = JSON.parse(data);
          const token = parsed.delta?.text;
          if (token) {
            chrome.tabs.sendMessage(tabId, { type: 'DEEPLENS_TOKEN', token });
          }
        } catch { /* skip malformed SSE line */ }
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') return; // user navigated / dismissed
    chrome.tabs.sendMessage(tabId, {
      type: 'DEEPLENS_TOKEN',
      error: 'NETWORK_ERROR',
      done: true
    });
  }
}
```

---

### 4.6 API Module — Claude Integration (`background/claudeAPI.ts`)

**Responsibility:** Build the final request body for the Anthropic API, including model selection, system prompt selection, token limits, and streaming flag.

**Request builder:**
```typescript
interface ClaudeRequest {
  model: string;
  max_tokens: number;
  stream: true;
  system: string;
  messages: Array<{ role: 'user'; content: string }>;
}

const MODEL = 'claude-sonnet-4-20250514';

const MAX_TOKENS: Record<QueryMode, number> = {
  quick: 200,
  deep: 600,
  links: 400
};

function buildClaudeRequest(payload: QueryPayload): ClaudeRequest {
  return {
    model: MODEL,
    max_tokens: MAX_TOKENS[payload.mode],
    stream: true,
    system: SYSTEM_PROMPTS[payload.mode],
    messages: [{
      role: 'user',
      content: buildUserMessage(payload.context)
    }]
  };
}

function buildUserMessage(ctx: ExtractedContext): string {
  return [
    `Word / phrase: "${ctx.selectedText}"`,
    `Surrounding sentence: "${ctx.sentenceContext}"`,
    `Page title: "${ctx.pageTitle}"`,
    `Domain: "${ctx.pageDomain}" (${ctx.domainCategory})`
  ].join('\n');
}
```

---

### 4.7 Prompt Builder (`background/prompts.ts`)

**Full system prompts per mode — these are finalized strings, not templates:**

```typescript
export const SYSTEM_PROMPTS: Record<QueryMode, string> = {

  quick: `You are DeepLens Quick — a cognitive shortcut engine built into the user's browser.
The user has paused on a word or phrase while reading. Give them exactly what they need to keep reading without stopping.

Respond in a single crisp paragraph, 3–4 sentences maximum:
1. What the term means in plain language
2. Why it matters in the context of what they are reading

Rules:
- No headers, no bullet points, no links
- No preamble ("Great question!", "Sure!", etc.)
- Write as if you are a senior practitioner talking to a sharp peer
- Adapt tone to domain: technical for docs/GitHub, conversational for news/social`,

  deep: `You are DeepLens — a cognitive intelligence layer for the web.
The user has selected a word or phrase while reading a complex piece of content.
Give them a structured understanding that helps them process this concept deeply without leaving the page.

Always respond in this exact format (markdown headers and sections):

**What it is**
2–3 sentences. Plain language. No jargon unless defined.

**Mental model**
One powerful analogy or mental model that makes this concept stick permanently.
Format: "Think of it as..." or "It works like..."

**Why it matters here**
1–2 sentences. Connect directly to the page context (title + domain provided).

**Related concepts**
- [Concept A]: one-line description
- [Concept B]: one-line description

**Go deeper**
- [Resource title](URL): one-sentence description
- [Resource title](URL): one-sentence description

Rules:
- Strict format — always all 5 sections
- Max 350 words total
- Links must be real, authoritative, and accurate
- No fluff, no padding, no acknowledgements`,

  links: `You are DeepLens Links — a precision resource finder.
Return exactly 4 curated resources for the given word or phrase.

Format each resource as:
**[Resource Title](URL)**
One sentence describing exactly what the user will find at this link and why it is useful.

Source priority order:
1. Official documentation or specification
2. Academic paper (arxiv, ACM, IEEE, Google Scholar)
3. Canonical technical blog (engineering.fb.com, research.google, a16z.com)
4. High-quality community resource (MDN, CSS-Tricks, Egghead)

Rules:
- 4 resources exactly — no more, no fewer
- URLs must be real and accurate — do not hallucinate URLs
- No SEO content farms, no listicle blogs, no paywalled content without warning
- Diversify sources — do not return 4 links from the same site`

};
```

---

### 4.8 Storage Module (`utils/storage.ts`)

**Responsibility:** Typed wrapper around `chrome.storage.local`. All reads and writes go through this module.

**Schema:**
```typescript
interface DeepLensStorage {
  apiKey: string;                    // Anthropic API key
  defaultMode: QueryMode;            // 'quick' | 'deep' | 'links'
  hoverDelayMs: number;              // 200–800, default 300
  hoverEnabled: boolean;             // default true
  selectionEnabled: boolean;         // default true
  blacklistedDomains: string[];      // e.g. ['mail.google.com', 'notion.so']
  isEnabled: boolean;                // global on/off, default true
  outputLanguage: string;            // ISO 639-1, default 'en'
  installedAt: number;               // timestamp for onboarding flow
}

const DEFAULTS: DeepLensStorage = {
  apiKey: '',
  defaultMode: 'deep',
  hoverDelayMs: 300,
  hoverEnabled: true,
  selectionEnabled: true,
  blacklistedDomains: [],
  isEnabled: true,
  outputLanguage: 'en',
  installedAt: Date.now()
};
```

**API:**
```typescript
export const storage = {
  async get<K extends keyof DeepLensStorage>(key: K): Promise<DeepLensStorage[K]> {
    const result = await chrome.storage.local.get(key);
    return result[key] ?? DEFAULTS[key];
  },

  async set<K extends keyof DeepLensStorage>(
    key: K, value: DeepLensStorage[K]
  ): Promise<void> {
    await chrome.storage.local.set({ [key]: value });
  },

  async getAll(): Promise<DeepLensStorage> {
    const stored = await chrome.storage.local.get(null);
    return { ...DEFAULTS, ...stored } as DeepLensStorage;
  }
};
```

---

### 4.9 Position Engine (`utils/position.ts`)

**Full positioning contract** — see Section 4.3. Additional edge cases:

- If `triggerRect` height > 100px (large selection), anchor to bottom of selection, not top
- If tooltip would cover the entire viewport width (viewport < 400px), render full-width at bottom of viewport instead
- On pinned/expanded mode: reposition to right edge of viewport, slide in from right, fixed position

---

### 4.10 Shadow DOM Manager (`content/shadowDOM.ts`)

**Responsibility:** Manage the single shadow DOM host element lifecycle. Ensure only one tooltip exists at a time.

**Key constraint:** The shadow root must use `mode: 'closed'` so host page JavaScript cannot access `shadowRoot` on the host element and read tooltip content or intercept user queries.

```typescript
export const shadowDOMManager = {
  host: null as HTMLElement | null,
  root: null as ShadowRoot | null,

  init(): ShadowRoot {
    if (this.root) return this.root;
    this.host = document.createElement('div');
    this.host.id = 'deeplens-host';
    this.host.setAttribute('aria-hidden', 'true'); // hide from page a11y tree
    document.documentElement.appendChild(this.host); // append to <html>, not <body>
    this.root = this.host.attachShadow({ mode: 'closed' });
    return this.root;
  },

  destroy(): void {
    this.host?.remove();
    this.host = null;
    this.root = null;
  }
};
```

Note: appending to `<html>` rather than `<body>` avoids interference from body overflow:hidden or transform properties that would affect fixed positioning.

---

## 5. API Contract

### 5.1 Anthropic API — Request Specification

**Endpoint:** `POST https://api.anthropic.com/v1/messages`

**Headers:**
```
Content-Type: application/json
x-api-key: {user_api_key}
anthropic-version: 2023-06-01
```

**Request body:**
```typescript
{
  model: "claude-sonnet-4-20250514",
  max_tokens: 200 | 400 | 600,  // depends on mode
  stream: true,
  system: string,               // mode-specific system prompt
  messages: [
    {
      role: "user",
      content: string           // context injection template
    }
  ]
}
```

### 5.2 SSE Response Format

Claude streams using the Anthropic SSE protocol:

```
event: message_start
data: {"type":"message_start","message":{"id":"msg_...","type":"message","role":"assistant","content":[],"model":"claude-sonnet-4-20250514","stop_reason":null,"stop_sequence":null,"usage":{"input_tokens":N,"output_tokens":0}}}

event: content_block_start
data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}

event: ping
data: {"type":"ping"}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Here"}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":" is"}}

... more deltas ...

event: content_block_stop
data: {"type":"content_block_stop","index":0}

event: message_delta
data: {"type":"message_delta","delta":{"stop_reason":"end_turn","stop_sequence":null},"usage":{"output_tokens":N}}

event: message_stop
data: {"type":"message_stop"}
```

**Parser contract:** Only process lines starting with `data: `. Extract `delta.text` from `content_block_delta` events. Stop on `message_stop`.

### 5.3 Error Codes and Handling

| HTTP Status | Anthropic Error Type | DeepLens Error Code | User Message |
|-------------|---------------------|---------------------|--------------|
| 401 | `authentication_error` | `NO_API_KEY` or `INVALID_KEY` | "Invalid API key. Check your settings." |
| 429 | `rate_limit_error` | `RATE_LIMIT` | "Too many requests. Try again in a moment." |
| 529 | `overloaded_error` | `API_OVERLOADED` | "AI is busy. Try again in a few seconds." |
| 400 | `invalid_request_error` | `BAD_REQUEST` | "Something went wrong. Please try again." |
| Network | — | `NETWORK_ERROR` | "No connection. Check your internet." |
| AbortError | — | `ABORTED` | (silent — user dismissed) |

---

## 6. Data Models

### 6.1 Core Types

```typescript
type QueryMode = 'quick' | 'deep' | 'links';
type TriggerMode = 'hover' | 'select';
type DomainCategory = 'technical' | 'academic' | 'news' | 'social' | 'general';
type DeepLensTheme = 'light' | 'dark';
type ExtensionState = 'idle' | 'loading' | 'streaming' | 'done' | 'error';

interface QueryPayload {
  mode: QueryMode;
  context: ExtractedContext;
  triggeredBy: TriggerMode;
  sessionId: string;  // random UUID per extension session, for abort routing
}

interface ExtractedContext {
  selectedText: string;
  sentenceContext: string;
  paragraphContext: string;
  headingContext: string | null;
  pageTitle: string;
  pageURL: string;
  pageDomain: string;
  domainCategory: DomainCategory;
}

interface TooltipState {
  isVisible: boolean;
  isPinned: boolean;
  currentMode: QueryMode;
  streamBuffer: string;
  status: ExtensionState;
  error: string | null;
  triggerRect: DOMRect | null;
  theme: DeepLensTheme;
}

interface TokenMessage {
  type: 'DEEPLENS_TOKEN';
  token?: string;
  done?: boolean;
  error?: string;
}

interface QueryMessage {
  type: 'DEEPLENS_QUERY';
  payload: QueryPayload;
}

interface AbortMessage {
  type: 'DEEPLENS_ABORT';
}

type ExtensionMessage = TokenMessage | QueryMessage | AbortMessage;
```

---

## 7. State Management

DeepLens is intentionally stateless across requests. The only in-memory state is per active tooltip session.

### 7.1 Content Script Session State

```typescript
// In-memory only. Cleared on tooltip destroy.
const tooltipState: TooltipState = {
  isVisible: false,
  isPinned: false,
  currentMode: 'deep',  // loaded from storage on first trigger
  streamBuffer: '',
  status: 'idle',
  error: null,
  triggerRect: null,
  theme: 'light'
};
```

### 7.2 State Transitions

```
idle
  → loading    (user trigger fired, message sent to SW)
    → streaming  (first token received)
      → done       (message_stop received)
      → error      (error token received)
  → idle         (tooltip destroyed / Escape / click-away)

loading → idle   (AbortError — user dismissed before first token)
```

### 7.3 Mode Change During Stream

If user clicks a different mode button while streaming:
1. Send `DEEPLENS_ABORT` to service worker
2. Clear stream buffer
3. Reset state to `loading`
4. Re-send `DEEPLENS_QUERY` with new mode

---

## 8. Security Architecture

### 8.1 API Key Security

**Threat:** Malicious page JS reads the API key from the extension.

**Mitigations:**
- API key stored in `chrome.storage.local` — inaccessible to page JS
- Content script does NOT read the API key at any point
- Content script sends query payload to service worker via `chrome.runtime.sendMessage`
- Service worker reads the key and makes the fetch — never passes the key back
- Shadow DOM is `mode: 'closed'` — page JS cannot traverse into tooltip DOM

**Key is never in:**
- Page context (`window`, `document`, `localStorage`, `sessionStorage`)
- Any message sent content → service worker (the query payload contains only text, not the key)
- Any URL parameter or HTTP header visible to content script

### 8.2 Content Security Policy

The extension's own pages (popup, options) use:
```
script-src 'self'; object-src 'self'
```

This means: no inline scripts, no eval, no external scripts. All JS must be in extension bundle files.

**Host page CSP conflict mitigation:**
If the host page's CSP blocks the tooltip's injected stylesheet (`link` element), fall back to inline `<style>` inside the shadow root. Inline styles are not subject to the host page's CSP when inside a Shadow DOM.

```typescript
function injectStyles(root: ShadowRoot): void {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = chrome.runtime.getURL('styles/tooltip.css');
  
  link.onerror = () => {
    // Fallback: fetch CSS text and inject as <style>
    fetch(chrome.runtime.getURL('styles/tooltip.css'))
      .then(r => r.text())
      .then(css => {
        const style = document.createElement('style');
        style.textContent = css;
        root.appendChild(style);
      });
  };
  
  root.appendChild(link);
}
```

### 8.3 Data Privacy

- Selected text is sent to Anthropic's API. This is disclosed clearly in:
  - Chrome Web Store listing
  - Extension popup ("Your text is sent to Anthropic's API to generate responses")
  - Privacy policy page (required for CWS)
- No query logging, no analytics, no server-side storage in v1.0
- Users can add domains to blacklist (banking, email, internal tools) to prevent any text capture

### 8.4 XSS Prevention

The stream renderer uses `innerHTML` to render markdown-to-HTML. This is an XSS vector if Claude returns malicious HTML.

**Mitigation:** Sanitize before setting innerHTML:
```typescript
import DOMPurify from 'dompurify'; // bundled into content script

function safeRenderMarkdown(text: string): string {
  const raw = renderMarkdown(text);
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: ['strong', 'em', 'a', 'ul', 'li', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });
}
```

---

## 9. Performance Specifications

### 9.1 Bundle Size Targets

| File | Target Size (gzipped) |
|------|-----------------------|
| `content/index.js` | < 40KB |
| `background/service-worker.js` | < 20KB |
| `popup/popup.js` | < 15KB |
| `styles/tooltip.css` | < 5KB |
| **Total extension size** | **< 500KB** |

DOMPurify is the largest dependency at ~18KB gzipped — acceptable given the XSS protection it provides.

### 9.2 Runtime Performance Budget

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to first tooltip render | < 50ms | After trigger fires |
| Time to first AI token | < 800ms | p95, measured from trigger |
| Full Quick response | < 3s | p95 |
| Full Deep response | < 6s | p95 |
| CPU usage while idle | < 0.5% | Chrome Task Manager |
| CPU usage during stream | < 3% | Chrome Task Manager |
| Memory footprint | < 15MB | Chrome Task Manager |
| `mouseover` listener latency | < 1ms | Never block event loop |

### 9.3 Debounce and Rate Limiting

**Hover debounce:** 300ms (configurable 200–800ms). Implemented with `setTimeout` + `clearTimeout`.

**Duplicate query prevention:** If user triggers the same word twice within 1 second of a completed response, do not re-query — show cached response. Cache is in-memory, single-entry (last response only), cleared on tooltip destroy.

**Session rate limit (client-side guard):** Maximum 30 queries per 10-minute window. Tracked in service worker memory. If exceeded, show "You've hit your rate limit for this session. Try again in a few minutes." Does not affect Anthropic's own rate limits — this is an additional client-side guard.

---

## 10. Error Handling and Resilience

### 10.1 Error Display Strategy

Errors render inside the tooltip stream div replacing the loading state. Never use browser alerts or console spam.

```
┌─────────────────────────────┐
│ eigenvalue          [x]      │
├─────────────────────────────┤
│ ⚠ Invalid API key.          │
│ Check settings → [Open]     │
└─────────────────────────────┘
```

### 10.2 Error Recovery Table

| Error Code | Recovery Action |
|-----------|-----------------|
| `NO_API_KEY` | Show "Add API key" button linking to popup |
| `INVALID_KEY` | Show "Invalid API key" + link to popup |
| `RATE_LIMIT` | Show countdown timer (retry after Xms from Retry-After header) |
| `API_OVERLOADED` | Show "Retry" button, auto-retry after 3s |
| `NETWORK_ERROR` | Show "Check connection" message |
| `BAD_REQUEST` | Show generic "Something went wrong" + auto-report option |
| `ABORTED` | Silent — tooltip is already dismissed |

### 10.3 Service Worker Termination

MV3 service workers can be terminated by Chrome between messages. If the service worker is terminated mid-stream:

- Content script detects the message channel closes (`chrome.runtime.lastError`)
- Shows "Connection lost. Tap to retry." with a retry button
- Retry re-sends the original `DEEPLENS_QUERY` — service worker wakes on message receipt

---

## 11. Testing Requirements

### 11.1 Unit Tests (Vitest)

| Module | Tests Required |
|--------|---------------|
| `extractor.ts` | `extractSentence` — 8 cases: normal sentence, no sentence, very long text, special chars, multiple matches, non-Latin chars, code blocks, empty body |
| `position.ts` | `computePosition` — 6 cases: normal, overflow right, overflow bottom, overflow both, narrow viewport, large selection |
| `detector.ts` | `getWordAtPoint` — 5 cases: normal word, numeric, too short, punctuation-only, hyphenated compound |
| `detector.ts` | `isExcluded` — 6 cases: input, textarea, contenteditable, normal p, form button, div with textbox role |
| `storage.ts` | get/set/defaults for each storage key |
| `prompts.ts` | All 3 system prompts are non-empty strings |
| `claudeAPI.ts` | `buildClaudeRequest` produces correct token limits per mode |

### 11.2 Integration Tests (Playwright + Chrome Extension)

Playwright supports loading unpacked Chrome extensions via `--load-extension`. Test suite:

```
tests/
├── hover-trigger.spec.ts     — hover 300ms fires tooltip, 200ms does not
├── select-trigger.spec.ts    — text selection fires tooltip at correct position
├── exclusion-zones.spec.ts   — no trigger inside input, textarea, contenteditable
├── abort-on-leave.spec.ts    — moving off word before 300ms cancels request
├── mode-switch.spec.ts       — switching mode mid-stream works correctly
├── dark-mode.spec.ts         — tooltip renders dark on dark pages
├── escape-dismiss.spec.ts    — Escape key dismisses tooltip
├── api-error.spec.ts         — invalid API key shows correct error state
├── csp-resilience.spec.ts    — tooltip renders on a page with strict CSP
└── blacklist.spec.ts         — extension is silent on blacklisted domain
```

### 11.3 Manual Test Checklist (Pre-Release)

Test on these specific sites before CWS submission:
- [ ] `github.com` (code + docs content, CSP headers present)
- [ ] `medium.com` (long-form article, heavy page)
- [ ] `twitter.com` / `x.com` (SPA, dynamic DOM)
- [ ] `notion.so` (should be on default blacklist)
- [ ] `mail.google.com` (should be on default blacklist)
- [ ] `arxiv.org` (academic PDF renderer)
- [ ] `docs.anthropic.com` (ironic — test on own docs)
- [ ] A page with `prefers-color-scheme: dark`

---

## 12. Build and Deployment Pipeline

### 12.1 Project Setup

```bash
# Scaffold
npm create vite@latest deeplens -- --template vanilla-ts
cd deeplens
npm install -D @crxjs/vite-plugin vitest playwright
npm install dompurify @types/dompurify
```

### 12.2 Vite Config (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

export default defineConfig({
  plugins: [crx({ manifest })],
  build: {
    rollupOptions: {
      input: {
        popup: 'popup/popup.html'
      }
    }
  }
});
```

### 12.3 Directory Structure

```
deeplens/
├── manifest.json
├── vite.config.ts
├── tsconfig.json
├── package.json
├── src/
│   ├── content/
│   │   ├── index.ts          # Entry: boots detector, tooltip, streamer
│   │   ├── detector.ts
│   │   ├── extractor.ts
│   │   ├── tooltip.ts
│   │   ├── streamer.ts
│   │   └── shadowDOM.ts
│   ├── background/
│   │   ├── service-worker.ts
│   │   ├── claudeAPI.ts
│   │   └── prompts.ts
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.ts
│   │   └── popup.css
│   └── utils/
│       ├── storage.ts
│       ├── position.ts
│       ├── debounce.ts
│       └── types.ts
├── styles/
│   └── tooltip.css
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── tests/
    ├── unit/
    └── e2e/
```

### 12.4 Build Commands

```json
{
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "test": "vitest run && playwright test",
    "zip": "node scripts/zip.js"   
  }
}
```

### 12.5 Chrome Web Store Submission Checklist

- [ ] All icons present (16, 48, 128)
- [ ] Privacy policy URL populated in CWS listing
- [ ] `host_permissions` limited to `api.anthropic.com` only
- [ ] No `eval` or dynamic code execution
- [ ] Permissions justified in CWS listing description
- [ ] Extension tested on Chrome stable (not just Canary)
- [ ] ZIP file does not include `node_modules`, `.git`, or source maps
- [ ] Version number in `manifest.json` matches CWS submission

---

## 13. Proxy Server Specification

*Deferred to v1.1. Spec included here for early planning.*

### 13.1 Purpose
For users who do not have an Anthropic API key, DeepLens can route through a hosted proxy. The proxy holds the platform API key server-side and bills usage to user accounts.

### 13.2 Stack
- **Runtime:** Vercel Edge Functions (Node.js 20)
- **Auth:** JWT issued at signup, validated per request
- **Rate limiting:** Upstash Redis — 100 requests/day on free tier, unlimited on paid

### 13.3 Endpoint Spec

```
POST /api/query
Authorization: Bearer {jwt}
Content-Type: application/json

Body: QueryPayload (same schema as direct API call)

Response: SSE stream identical to Anthropic SSE format
  — proxied directly, not buffered
```

### 13.4 Security on Proxy

- JWT is validated via `jose` library before any upstream call
- Platform API key is in Vercel environment variables, never in bundle
- Request body is validated against `QueryPayload` schema — reject anything extra
- No request bodies are logged or persisted
- IP-based rate limiting as secondary layer (100 req/min per IP)

---

## 14. Browser Compatibility and CSP Handling

### 14.1 Chrome Version Support

| Chrome Version | Support | Notes |
|----------------|---------|-------|
| 120+ | ✅ Full | Primary target |
| 110–119 | ✅ Full | MV3 stable |
| 88–109 | ⚠ Partial | MV3 introduced at 88, some APIs vary |
| < 88 | ❌ None | MV2 only |

### 14.2 Known CSP Conflicts

| Site | CSP Issue | Resolution |
|------|-----------|------------|
| GitHub | `style-src` blocks external stylesheets | Inline CSS fallback in shadow root |
| Notion | `frame-ancestors` prevents certain injections | Shadow DOM append to `<html>` element, not `<body>` |
| Google products | Strict `script-src` | Content script bundle only uses `'self'` — compliant |
| Linear.app | `default-src` strict | Test required — may need `web_accessible_resources` tweak |

### 14.3 SPA Compatibility

Single-Page Applications (React, Next.js, Vue) that don't trigger full page loads require the content script to reinitialize event listeners on navigation.

**Solution:** Listen for `popstate` and `pushState` intercept:
```typescript
// Reinitialize on SPA navigation
const originalPushState = history.pushState.bind(history);
history.pushState = (...args) => {
  originalPushState(...args);
  window.dispatchEvent(new Event('deeplens:navigate'));
};

window.addEventListener('popstate', () => {
  window.dispatchEvent(new Event('deeplens:navigate'));
});

window.addEventListener('deeplens:navigate', () => {
  destroyTooltip();
  reinitDetector();
});
```

---

## 15. Technical Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `caretRangeFromPoint` returns null on some browsers/OSes | Medium | Hover detection fails silently | Fallback: use `elementFromPoint` + `TreeWalker` to find word under cursor |
| Shadow DOM `mode: closed` blocks our own tooltip JS in some edge cases | Low | Tooltip buttons non-functional | Store shadow root reference in closure, not via `host.shadowRoot` |
| Service worker terminated mid-stream | Medium | Stream cuts off | Detect via `chrome.runtime.lastError`; show retry CTA |
| MV3 `host_permissions` change in future Chrome release | Low | API calls break | Monitor Chrome dev blog; `activeTab` + scripting API as fallback |
| `caretRangeFromPoint` deprecated (already non-standard) | Low | Hover detection breaks on future Chrome | Fallback to `Selection` API + `Range` expansion on mousedown |
| DOMPurify adds 18KB to content script | Certain | Bundle size increase | Acceptable — XSS protection is not optional |
| Anthropic SSE format changes in future API version | Low | Stream parser breaks | Pin `anthropic-version` header; document update process |
| Token streaming too fast for incremental re-render | Low | CPU spike during stream | Batch DOM updates using `requestAnimationFrame`, max 1 innerHTML write per frame |

---

## Appendix A — tooltip.css Skeleton

```css
/* Shadow DOM scoped — these rules do not leak to host page */

:host {
  all: initial;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  line-height: 1.5;
}

.dl-tooltip {
  position: fixed;
  width: 380px;
  max-height: 440px;
  overflow-y: auto;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  z-index: 2147483647;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dl-tooltip[data-theme="light"] {
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.1);
  color: #111;
}

.dl-tooltip[data-theme="dark"] {
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.12);
  color: #e8e8e8;
}

.dl-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(128,128,128,0.15);
}

.dl-word {
  font-weight: 600;
  font-size: 13px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dl-modes {
  display: flex;
  gap: 4px;
}

.dl-mode-btn {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid rgba(128,128,128,0.25);
  background: transparent;
  cursor: pointer;
  color: inherit;
  opacity: 0.6;
}

.dl-mode-btn.active {
  opacity: 1;
  background: rgba(128,128,128,0.12);
}

.dl-body {
  padding: 12px 14px;
  max-height: 340px;
  overflow-y: auto;
}

.dl-stream p { margin: 0 0 8px; }
.dl-stream strong { font-weight: 600; }
.dl-stream ul { margin: 4px 0; padding-left: 18px; }
.dl-stream li { margin-bottom: 4px; }
.dl-stream a {
  color: #4f8ef7;
  text-decoration: none;
}
.dl-stream a:hover { text-decoration: underline; }

.dl-footer {
  padding: 6px 14px;
  font-size: 11px;
  opacity: 0.5;
  border-top: 1px solid rgba(128,128,128,0.1);
}

/* Pinned / expanded state */
.dl-tooltip.pinned {
  width: 480px;
  max-height: 600px;
}

/* Streaming cursor */
.dl-stream::after {
  content: '▌';
  animation: blink 1s step-end infinite;
}
.dl-stream.done::after { display: none; }

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
```

---

*DeepLens TRD v1.0 — 0xVerse / eth-content-architect*  
*Cross-reference: DeepLens PRD v1.0*
