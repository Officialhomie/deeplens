import { isTokenMessage, type QueryMode, type TokenMessage } from '../shared/types';
import { notifyStreamStarted } from './detector';
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

export function prepareStream(
  queryId: string,
  triggerRect: DOMRect,
  word: string,
  mode: QueryMode,
): void {
  activeQueryId = queryId;
  showTooltip(word, triggerRect, mode);
}

export function resetStream(): void {
  activeQueryId = null;
  destroyTooltip(true);
}

function isStaleMessage(msg: TokenMessage): boolean {
  if (!msg.queryId || !activeQueryId) return true;
  return msg.queryId !== activeQueryId;
}

function handleTokenMessage(msg: TokenMessage): void {
  if (isStaleMessage(msg)) return;

  if (msg.error) {
    showTooltipError(msg.error);
    activeQueryId = null;
    return;
  }

  if (msg.token) {
    notifyStreamStarted();
    tooltipState.streamBuffer = appendToBuffer(
      tooltipState.streamBuffer,
      msg.token,
    );
    const html = safeRenderMarkdown(tooltipState.streamBuffer);
    setStreamingContent(html, true);
  }

  if (msg.done) {
    setDoneState();
    activeQueryId = null;
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
