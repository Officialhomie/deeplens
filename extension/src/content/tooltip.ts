import {
  computePinnedPosition,
  computePosition,
  estimateTooltipHeight,
  TOOLTIP_WIDTH,
  TOOLTIP_WIDTH_PINNED,
} from '../shared/position';
import type {
  DeepLensTheme,
  ExtractedContext,
  QueryMode,
  TriggerMode,
} from '../shared/types';
import { setSessionMode } from './sessionMode';
import { safeRenderMarkdown } from './sanitize';
import { shadowDOMManager } from './shadowDOM';
import { detectPageTheme } from './theme';

export const DEEPLENS_MODE_CHANGE = 'deeplens:mode-change';

export interface TooltipSessionState {
  isVisible: boolean;
  isPinned: boolean;
  currentMode: QueryMode;
  streamBuffer: string;
  status: 'idle' | 'loading' | 'streaming' | 'done' | 'error';
  error: string | null;
  triggerRect: DOMRect | null;
  theme: DeepLensTheme;
  extractedContext: ExtractedContext | null;
  triggerMode: TriggerMode | null;
}

export const tooltipState: TooltipSessionState = {
  isVisible: false,
  isPinned: false,
  currentMode: 'deep',
  streamBuffer: '',
  status: 'idle',
  error: null,
  triggerRect: null,
  theme: 'light',
  extractedContext: null,
  triggerMode: null,
};

let tooltipEl: HTMLElement | null = null;
let streamEl: HTMLElement | null = null;
let statusEl: HTMLElement | null = null;
let fadeTimer: ReturnType<typeof setTimeout> | null = null;
let listenersBound = false;

declare global {
  interface DocumentEventMap {
    'deeplens:mode-change': CustomEvent<{ mode: QueryMode }>;
  }
}

function clearFadeTimer(): void {
  if (fadeTimer !== null) {
    clearTimeout(fadeTimer);
    fadeTimer = null;
  }
}

function injectStyles(root: ShadowRoot): void {
  if (root.querySelector('#dl-tooltip-css') || root.querySelector('#dl-tooltip-css-inline')) {
    return;
  }
  const href = chrome.runtime.getURL('styles/tooltip.css');
  const link = document.createElement('link');
  link.id = 'dl-tooltip-css';
  link.rel = 'stylesheet';
  link.href = href;

  link.onerror = () => {
    void fetch(href)
      .then((r) => r.text())
      .then((css) => {
        if (root.querySelector('#dl-tooltip-css-inline')) return;
        const style = document.createElement('style');
        style.id = 'dl-tooltip-css-inline';
        style.textContent = css;
        root.appendChild(style);
      })
      .catch(() => undefined);
  };

  root.appendChild(link);
}

function bindHostEvents(): void {
  const host = shadowDOMManager.host;
  if (!host) return;

  host.addEventListener('mouseenter', clearFadeTimer);
  host.addEventListener('mouseleave', () => {
    if (tooltipState.isPinned || !tooltipState.isVisible) return;
    fadeTimer = setTimeout(() => destroyTooltip(), 1500);
  });
}

function applyPosition(): void {
  if (!tooltipEl || !tooltipState.triggerRect) return;

  const viewport = { width: window.innerWidth, height: window.innerHeight };
  const width = tooltipState.isPinned ? TOOLTIP_WIDTH_PINNED : TOOLTIP_WIDTH;
  const height = estimateTooltipHeight(
    tooltipState.isPinned,
    tooltipState.status === 'idle' ? 'loading' : tooltipState.status,
  );

  const pos = tooltipState.isPinned
    ? computePinnedPosition(viewport, height)
    : computePosition({
        triggerRect: tooltipState.triggerRect,
        tooltipWidth: width,
        tooltipHeight: height,
        viewport,
      });

  tooltipEl.style.top = `${pos.top}px`;
  tooltipEl.style.left = `${pos.left}px`;
}

function buildTooltipDom(word: string, mode: QueryMode): HTMLElement {
  const el = document.createElement('div');
  el.className = 'dl-tooltip';
  el.innerHTML = `
    <div class="dl-header">
      <span class="dl-word" title="${escapeAttr(word)}"></span>
      <div class="dl-modes">
        <button type="button" class="dl-mode-btn" data-mode="quick">Quick</button>
        <button type="button" class="dl-mode-btn" data-mode="deep">Deep</button>
      </div>
      <div class="dl-actions">
        <button type="button" class="dl-pin dl-icon-btn" aria-label="Pin tooltip" title="Pin">📌</button>
        <button type="button" class="dl-copy dl-icon-btn" aria-label="Copy response" title="Copy">⎘</button>
        <button type="button" class="dl-close dl-icon-btn" aria-label="Close" title="Close">✕</button>
      </div>
    </div>
    <div class="dl-body">
      <div class="dl-skeleton">
        <div class="dl-skel-bar"></div>
        <div class="dl-skel-bar short"></div>
        <div class="dl-skel-bar"></div>
      </div>
      <div class="dl-stream" hidden></div>
      <div class="dl-error-panel" hidden></div>
    </div>
    <div class="dl-footer">
      <span class="dl-status">Thinking…</span>
    </div>
  `;

  el.querySelector('.dl-word')!.textContent = word;
  setActiveModeButton(el, mode);
  wireTooltipControls(el);
  return el;
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, '&quot;');
}

function setActiveModeButton(root: HTMLElement, mode: QueryMode): void {
  root.querySelectorAll('.dl-mode-btn').forEach((btn) => {
    const m = (btn as HTMLElement).dataset.mode;
    btn.classList.toggle('active', m === mode);
  });
  root.dataset.mode = mode;
}

function wireTooltipControls(el: HTMLElement): void {
  el.querySelector('.dl-close')?.addEventListener('click', () => destroyTooltip());

  el.querySelector('.dl-pin')?.addEventListener('click', () => togglePin());

  el.querySelector('.dl-copy')?.addEventListener('click', () => {
    if (tooltipState.streamBuffer) {
      void navigator.clipboard.writeText(tooltipState.streamBuffer);
      setFooter('Copied');
    }
  });

  el.querySelectorAll('.dl-mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = (btn as HTMLElement).dataset.mode as QueryMode;
      if (mode === tooltipState.currentMode) return;
      tooltipState.currentMode = mode;
      setSessionMode(mode);
      setActiveModeButton(el, mode);
      document.dispatchEvent(
        new CustomEvent(DEEPLENS_MODE_CHANGE, { detail: { mode } }),
      );
    });
  });
}

function setFooter(text: string): void {
  if (statusEl) statusEl.textContent = text;
}

function setStatusAttr(status: TooltipSessionState['status']): void {
  tooltipState.status = status;
  if (tooltipEl) tooltipEl.dataset.status = status;
}

function showBodyPanel(panel: 'skeleton' | 'stream' | 'error'): void {
  if (!tooltipEl) return;
  const skeleton = tooltipEl.querySelector('.dl-skeleton') as HTMLElement;
  const stream = tooltipEl.querySelector('.dl-stream') as HTMLElement;
  const error = tooltipEl.querySelector('.dl-error-panel') as HTMLElement;
  skeleton.hidden = panel !== 'skeleton';
  stream.hidden = panel !== 'stream';
  error.hidden = panel !== 'error';
}

export function showTooltip(
  word: string,
  triggerRect: DOMRect,
  mode: QueryMode,
): void {
  clearFadeTimer();
  const root = shadowDOMManager.init();
  injectStyles(root);

  if (shadowDOMManager.host) {
    shadowDOMManager.host.style.cssText =
      'all: initial; position: fixed; inset: 0; z-index: 2147483647; pointer-events: none;';
    shadowDOMManager.host.style.pointerEvents = 'auto';
  }

  if (!tooltipEl) {
    tooltipEl = buildTooltipDom(word, mode);
    root.appendChild(tooltipEl);
    streamEl = tooltipEl.querySelector('.dl-stream');
    statusEl = tooltipEl.querySelector('.dl-status');
    bindHostEvents();
  } else {
    tooltipEl.querySelector('.dl-word')!.textContent = word;
    setActiveModeButton(tooltipEl, mode);
  }

  tooltipState.isVisible = true;
  tooltipState.isPinned = false;
  tooltipState.currentMode = mode;
  tooltipState.triggerRect = triggerRect;
  tooltipState.streamBuffer = '';
  tooltipState.error = null;
  tooltipState.theme = detectPageTheme();

  tooltipEl.classList.remove('is-pinned');
  tooltipEl.dataset.theme = tooltipState.theme;
  setStatusAttr('loading');
  showBodyPanel('skeleton');
  setFooter('Thinking…');
  if (streamEl) streamEl.innerHTML = '';

  applyPosition();
}

export function setStreamingContent(html: string, showCursor: boolean): void {
  if (!streamEl) return;
  showBodyPanel('stream');
  streamEl.innerHTML = html + (showCursor ? '<span class="dl-cursor"></span>' : '');
  setStatusAttr('streaming');
  setFooter('Streaming…');
}

export function setDoneState(): void {
  if (!streamEl) return;
  setStatusAttr('done');
  setFooter('Done');
  streamEl.innerHTML = safeRenderMarkdown(tooltipState.streamBuffer);
}

export function showTooltipError(code: string): void {
  if (!tooltipEl) return;
  if (code === 'ABORTED') {
    destroyTooltip(true);
    return;
  }

  setStatusAttr('error');
  tooltipState.error = code;
  showBodyPanel('error');

  const panel = tooltipEl.querySelector('.dl-error-panel') as HTMLElement;
  const { message, actionLabel, action } = errorContent(code);
  panel.innerHTML = `
    <p class="dl-error-msg">${message}</p>
    ${actionLabel ? `<button type="button" class="dl-error-action">${actionLabel}</button>` : ''}
  `;
  if (actionLabel && action) {
    panel.querySelector('.dl-error-action')?.addEventListener('click', action);
  }
  setFooter(code);
  applyPosition();
}

function errorContent(code: string): {
  message: string;
  actionLabel: string | null;
  action: (() => void) | null;
} {
  switch (code) {
    case 'NO_API_KEY':
    case 'INVALID_KEY':
      return {
        message: 'Invalid or missing API key.',
        actionLabel: 'Open settings',
        action: openSettings,
      };
    case 'RATE_LIMIT':
    case 'SESSION_RATE_LIMIT':
      return {
        message: 'Too many requests. Try again in a few minutes.',
        actionLabel: null,
        action: null,
      };
    case 'API_OVERLOADED':
      return {
        message: 'AI is busy right now.',
        actionLabel: 'Retry',
        action: () =>
          document.dispatchEvent(
            new CustomEvent(DEEPLENS_MODE_CHANGE, {
              detail: { mode: tooltipState.currentMode },
            }),
          ),
      };
    case 'NETWORK_ERROR':
      return {
        message: 'No connection. Check your internet.',
        actionLabel: null,
        action: null,
      };
    default:
      return {
        message: 'Something went wrong. Please try again.',
        actionLabel: null,
        action: null,
      };
  }
}

function openSettings(): void {
  chrome.runtime
    .sendMessage({ type: 'DEEPLENS_OPEN_SETTINGS' })
    .catch(() => undefined);
}

export function togglePin(): void {
  tooltipState.isPinned = !tooltipState.isPinned;
  tooltipEl?.classList.toggle('is-pinned', tooltipState.isPinned);
  tooltipEl?.querySelector('.dl-pin')?.classList.toggle('is-pinned', tooltipState.isPinned);
  clearFadeTimer();
  applyPosition();
}

export function destroyTooltip(silent = false): void {
  clearFadeTimer();
  if (!silent && tooltipState.status === 'loading') {
    /* silent abort during loading — no error UI */
  }
  tooltipState.isVisible = false;
  tooltipState.isPinned = false;
  tooltipState.status = 'idle';
  tooltipState.streamBuffer = '';
  tooltipState.error = null;
  tooltipState.triggerRect = null;
  tooltipEl = null;
  streamEl = null;
  statusEl = null;
  shadowDOMManager.destroy();
}

export function getStreamElement(): HTMLElement | null {
  return streamEl;
}

export function initTooltip(): void {
  if (listenersBound) return;
  listenersBound = true;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && tooltipState.isVisible) destroyTooltip();
  });

  document.addEventListener(
    'mousedown',
    (e) => {
      const host = shadowDOMManager.host;
      if (!host || !tooltipState.isVisible) return;
      if (!host.contains(e.target as Node)) destroyTooltip();
    },
    true,
  );

  document.addEventListener('deeplens:abort', () => destroyTooltip(true));
}
