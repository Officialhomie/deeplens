import { computePosition } from '../shared/position';
import { shadowDOMManager } from './shadowDOM';

const SHELL_STYLES = `
  .dl-panel {
    position: fixed;
    z-index: 2147483647;
    width: 320px;
    max-height: 360px;
    overflow: auto;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    border-radius: 10px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    border: 1px solid rgba(0,0,0,0.1);
    background: #fff;
    color: #111;
  }
  .dl-panel[data-theme="dark"] {
    background: #1a1a2e;
    color: #e2e2f0;
    border-color: rgba(255,255,255,0.12);
  }
  .dl-header {
    padding: 10px 12px;
    border-bottom: 1px solid rgba(0,0,0,0.08);
    font-weight: 700;
  }
  .dl-status { padding: 8px 12px; font-size: 12px; color: #666; }
  .dl-stream { padding: 10px 12px 12px; }
  .dl-stream p { margin: 0 0 8px; }
  .dl-stream ul { margin: 0 0 8px; padding-left: 18px; }
  .dl-error { padding: 10px 12px; color: #c0392b; font-size: 13px; }
`;

let panelEl: HTMLElement | null = null;
let streamEl: HTMLElement | null = null;
let statusEl: HTMLElement | null = null;

function detectTheme(): 'light' | 'dark' {
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

function injectStyles(root: ShadowRoot): void {
  if (root.querySelector('#dl-styles')) return;
  const style = document.createElement('style');
  style.id = 'dl-styles';
  style.textContent = SHELL_STYLES;
  root.appendChild(style);

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = chrome.runtime.getURL('styles/tooltip.css');
  root.appendChild(link);
}

export function showStreamShell(
  word: string,
  triggerRect: DOMRect,
): { streamEl: HTMLElement; statusEl: HTMLElement } {
  const root = shadowDOMManager.init();
  injectStyles(root);

  if (!panelEl) {
    panelEl = document.createElement('div');
    panelEl.className = 'dl-panel';
    panelEl.innerHTML = `
      <div class="dl-header"></div>
      <div class="dl-status"></div>
      <div class="dl-stream"></div>
    `;
    root.appendChild(panelEl);
  }

  const theme = detectTheme();
  panelEl.dataset.theme = theme;
  panelEl.querySelector('.dl-header')!.textContent = word;

  statusEl = panelEl.querySelector('.dl-status') as HTMLElement;
  streamEl = panelEl.querySelector('.dl-stream') as HTMLElement;
  statusEl.textContent = 'Thinking…';
  streamEl.innerHTML = '';

  const pos = computePosition({
    triggerRect,
    tooltipWidth: 320,
    tooltipHeight: 200,
    viewport: { width: window.innerWidth, height: window.innerHeight },
  });

  panelEl.style.top = `${pos.top}px`;
  panelEl.style.left = `${pos.left}px`;

  if (shadowDOMManager.host) {
    shadowDOMManager.host.style.cssText =
      'all: initial; position: fixed; z-index: 2147483647; top: 0; left: 0;';
  }

  return { streamEl, statusEl };
}

export function showStreamError(code: string): void {
  if (!panelEl) return;
  const err = panelEl.querySelector('.dl-error') ?? document.createElement('div');
  err.className = 'dl-error';
  err.textContent = errorMessage(code);
  if (!panelEl.contains(err)) {
    panelEl.querySelector('.dl-stream')?.replaceWith(err);
  }
}

function errorMessage(code: string): string {
  switch (code) {
    case 'NO_API_KEY':
    case 'INVALID_KEY':
      return 'Invalid or missing API key. Open extension settings.';
    case 'RATE_LIMIT':
    case 'SESSION_RATE_LIMIT':
      return 'Too many requests. Try again in a few minutes.';
    case 'API_OVERLOADED':
      return 'AI is busy. Try again shortly.';
    case 'NETWORK_ERROR':
      return 'No connection. Check your internet.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export function hideStreamShell(): void {
  shadowDOMManager.destroy();
  panelEl = null;
  streamEl = null;
  statusEl = null;
}

export function getStreamElement(): HTMLElement | null {
  return streamEl;
}

export function getStatusElement(): HTMLElement | null {
  return statusEl;
}
