import {
  ERROR_CODE,
  STREAM_IDLE_TIMEOUT_MS,
} from '../shared/errors';
import { isTokenMessage, type QueryMode, type TokenMessage } from '../shared/types';
import { notifyStreamStarted, type TriggerPayload } from './detector';
import { rememberCompletedResponse } from './queryCoordinator';
import { cancelScheduledRender, scheduleRender } from './renderScheduler';
import { safeRenderMarkdown } from './sanitize';
import { appendToBuffer } from './streamRenderer';
import {
  destroyTooltip,
  resetTooltipForNewQuery,
  setDoneState,
  setFooter,
  setStreamingContent,
  showTooltip,
  showTooltipError,
  tooltipState,
} from './tooltip';

let activeQueryId: string | null = null;
let streamWatchdog: ReturnType<typeof setTimeout> | null = null;
let lastStreamWord: string | null = null;
let lastStreamMode: QueryMode | null = null;

function clearStreamWatchdog(): void {
  if (streamWatchdog !== null) {
    clearTimeout(streamWatchdog);
    streamWatchdog = null;
  }
}

function resetStreamWatchdog(): void {
  clearStreamWatchdog();
  if (!activeQueryId) return;
  streamWatchdog = setTimeout(() => {
    if (activeQueryId) {
      showTooltipError(ERROR_CODE.CONNECTION_LOST);
      activeQueryId = null;
    }
  }, STREAM_IDLE_TIMEOUT_MS);
}

function flushStreamToDom(showCursor: boolean): void {
  const html = safeRenderMarkdown(tooltipState.streamBuffer);
  setStreamingContent(html, showCursor);
}

export function applyCachedResponse(
  trigger: TriggerPayload,
  mode: QueryMode,
  streamBuffer: string,
): void {
  const queryId = crypto.randomUUID();
  prepareStream(queryId, trigger.rect, trigger.text, mode);
  tooltipState.streamBuffer = streamBuffer;
  flushStreamToDom(false);
  setDoneState();
  const ctx = tooltipState.extractedContext;
  if (ctx) {
    rememberCompletedResponse(trigger.text, mode, ctx.pageDomain, streamBuffer);
  }
}

export function prepareStream(
  queryId: string,
  triggerRect: DOMRect,
  word: string,
  mode: QueryMode,
): void {
  activeQueryId = queryId;
  lastStreamWord = word;
  lastStreamMode = mode;
  clearStreamWatchdog();
  cancelScheduledRender();
  showTooltip(word, triggerRect, mode);
  setFooter('Thinking…');
  resetStreamWatchdog();
}

/** Keep tooltip open; cancel in-flight stream (new query or soft abort). */
export function softAbortStream(): void {
  activeQueryId = null;
  clearStreamWatchdog();
  cancelScheduledRender();
  resetTooltipForNewQuery();
}

export function resetStream(): void {
  activeQueryId = null;
  clearStreamWatchdog();
  cancelScheduledRender();
  destroyTooltip(true);
}

function isStaleMessage(msg: TokenMessage): boolean {
  if (!msg.queryId || !activeQueryId) return true;
  return msg.queryId !== activeQueryId;
}

function completeStream(): void {
  clearStreamWatchdog();
  cancelScheduledRender();

  const bufferLen = tooltipState.streamBuffer.trim().length;

  if (bufferLen === 0) {
    showTooltipError(ERROR_CODE.API_ERROR);
    activeQueryId = null;
    return;
  }

  flushStreamToDom(false);
  setDoneState();

  const ctx = tooltipState.extractedContext;
  if (lastStreamWord && lastStreamMode && ctx) {
    rememberCompletedResponse(
      lastStreamWord,
      lastStreamMode,
      ctx.pageDomain,
      tooltipState.streamBuffer,
    );
  }
  activeQueryId = null;
}

function handleTokenMessage(msg: TokenMessage): void {
  if (isStaleMessage(msg)) return;

  if (msg.error) {
    clearStreamWatchdog();
    cancelScheduledRender();
    showTooltipError(msg.error, msg.retryAfterMs);
    activeQueryId = null;
    return;
  }

  if (msg.token) {
    resetStreamWatchdog();
    notifyStreamStarted();
    const isFirstToken = tooltipState.streamBuffer.length === 0;
    tooltipState.streamBuffer = appendToBuffer(
      tooltipState.streamBuffer,
      msg.token,
    );
    if (isFirstToken) {
      flushStreamToDom(true);
    } else {
      scheduleRender(() => flushStreamToDom(true));
    }
  }

  if (msg.done) {
    completeStream();
  }
}

export function initStreamer(): void {
  document.addEventListener('deeplens:soft-abort', () => {
    softAbortStream();
  });

  chrome.runtime.onMessage.addListener((message, sender) => {
    if (sender.id !== chrome.runtime.id) return;
    if (!isTokenMessage(message)) return;
    handleTokenMessage(message);
    if (import.meta.env.DEV && message.error) {
      console.debug('[DeepLens] stream error:', message.error);
    }
  });
}
