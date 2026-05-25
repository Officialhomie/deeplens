import { streamClaudeResponse } from './claudeAPI';
import { checkSessionRateLimit } from './rateLimiter';
import {
  beginQuery,
  invalidateQuery,
  isActiveQuery,
} from './streamSession';
import { storage } from '../shared/storage';
import { ERROR_CODE } from '../shared/errors';
import {
  isAbortMessage,
  isQueryMessage,
  MESSAGE,
  type QueryPayload,
} from '../shared/types';

let currentAbortController: AbortController | null = null;

function sendToken(
  tabId: number,
  msg: {
    type: typeof MESSAGE.TOKEN;
    queryId: string;
    token?: string;
    done?: boolean;
    error?: string;
  },
): void {
  if (!isActiveQuery(tabId, msg.queryId)) return;
  chrome.tabs.sendMessage(tabId, msg).catch(() => {
    /* tab closed */
  });
}

async function handleQuery(payload: QueryPayload, tabId: number): Promise<void> {
  currentAbortController?.abort();
  currentAbortController = new AbortController();
  const signal = currentAbortController.signal;

  beginQuery(tabId, payload.queryId);

  if (!checkSessionRateLimit()) {
    sendToken(tabId, {
      type: MESSAGE.TOKEN,
      queryId: payload.queryId,
      error: ERROR_CODE.SESSION_RATE_LIMIT,
      done: true,
    });
    return;
  }

  const apiKey = await storage.get('apiKey');
  if (!apiKey.trim()) {
    sendToken(tabId, {
      type: MESSAGE.TOKEN,
      queryId: payload.queryId,
      error: ERROR_CODE.NO_API_KEY,
      done: true,
    });
    return;
  }

  const isStale = () => !isActiveQuery(tabId, payload.queryId);

  await streamClaudeResponse(apiKey, payload, signal, (msg) => {
    sendToken(tabId, msg);
  }, isStale);
}

export function registerMessageRouter(): void {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (isQueryMessage(message)) {
      const tabId = sender.tab?.id;
      if (tabId === undefined) {
        sendResponse({ ok: false, error: 'NO_TAB' });
        return true;
      }
      void handleQuery(message.payload, tabId);
      sendResponse({ ok: true });
      return true;
    }

    if (isAbortMessage(message)) {
      currentAbortController?.abort();
      currentAbortController = null;
      const tabId = sender.tab?.id;
      if (tabId !== undefined) invalidateQuery(tabId);
      sendResponse({ ok: true });
      return true;
    }

    return false;
  });
}
