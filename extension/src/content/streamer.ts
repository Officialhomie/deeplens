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
  setDoneState,
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
  resetStreamWatchdog();
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
    tooltipState.streamBuffer = appendToBuffer(
      tooltipState.streamBuffer,
      msg.token,
    );
    scheduleRender(() => flushStreamToDom(true));
  }

  if (msg.done) {
    completeStream();
  }
}

export function initStreamer(): void {
  chrome.runtime.onMessage.addListener((message, sender) => {
    if (sender.id !== chrome.runtime.id) return;
    if (!isTokenMessage(message)) return;
    handleTokenMessage(message);
    if (import.meta.env.DEV && message.error) {
      console.debug('[DeepLens] stream error:', message.error);
    }
  });
}
