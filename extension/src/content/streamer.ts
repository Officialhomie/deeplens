import { isTokenMessage, type QueryMode, type TokenMessage } from '../shared/types';
import { notifyStreamStarted } from './detector';
import { appendToBuffer, renderMarkdown } from './streamRenderer';
import {
  getStatusElement,
  getStreamElement,
  hideStreamShell,
  showStreamError,
  showStreamShell,
} from './streamShell';
import { tooltipState } from './tooltip';

let activeQueryId: string | null = null;

export function prepareStream(
  queryId: string,
  triggerRect: DOMRect,
  word: string,
  mode: QueryMode,
): void {
  activeQueryId = queryId;
  tooltipState.isVisible = true;
  tooltipState.status = 'loading';
  tooltipState.streamBuffer = '';
  tooltipState.error = null;
  tooltipState.currentMode = mode;
  tooltipState.triggerRect = triggerRect;

  showStreamShell(word, triggerRect);
}

export function resetStream(): void {
  activeQueryId = null;
  tooltipState.status = 'idle';
  tooltipState.streamBuffer = '';
  tooltipState.isVisible = false;
  hideStreamShell();
}

function isStaleMessage(msg: TokenMessage): boolean {
  if (!msg.queryId || !activeQueryId) return true;
  return msg.queryId !== activeQueryId;
}

function handleTokenMessage(msg: TokenMessage): void {
  if (isStaleMessage(msg)) return;

  if (msg.error) {
    tooltipState.status = 'error';
    tooltipState.error = msg.error;
    showStreamError(msg.error);
    activeQueryId = null;
    return;
  }

  if (msg.token) {
    notifyStreamStarted();
    tooltipState.status = 'streaming';
    tooltipState.streamBuffer = appendToBuffer(
      tooltipState.streamBuffer,
      msg.token,
    );
    const el = getStreamElement();
    const status = getStatusElement();
    if (status) status.textContent = 'Streaming…';
    if (el) el.innerHTML = renderMarkdown(tooltipState.streamBuffer);
  }

  if (msg.done) {
    tooltipState.status = 'done';
    const status = getStatusElement();
    if (status) status.textContent = 'Done';
    activeQueryId = null;
  }
}

/** Phase 4 — SSE token receiver and stream state (TRD §4.4) */
export function initStreamer(): void {
  chrome.runtime.onMessage.addListener((message) => {
    if (!isTokenMessage(message)) return;
    handleTokenMessage(message);
    if (import.meta.env.DEV && message.error) {
      console.debug('[DeepLens] stream error:', message.error);
    }
  });

  document.addEventListener('deeplens:abort', () => {
    resetStream();
  });
}
