import { streamClaudeResponse } from './claudeAPI';
import { checkSessionRateLimit } from './rateLimiter';
import { getApiKey } from './storageSecure';
import {
  beginQuery,
  invalidateQuery,
  isActiveQuery,
} from './streamSession';
import { isTrustedExtensionSender, isTrustedTabSender } from './trust';
import { ERROR_CODE } from '../shared/errors';
import { safeDebug } from '../shared/safeLog';
import {
  assertPayloadHasNoSecrets,
  validateQueryPayload,
} from '../shared/validatePayload';
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
    retryAfterMs?: number;
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
  assertPayloadHasNoSecrets(payload);

  if (!checkSessionRateLimit()) {
    sendToken(tabId, {
      type: MESSAGE.TOKEN,
      queryId: payload.queryId,
      error: ERROR_CODE.SESSION_RATE_LIMIT,
      done: true,
    });
    return;
  }

  const apiKey = await getApiKey();
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
    if (!isTrustedExtensionSender(sender)) {
      return false;
    }

    if (isQueryMessage(message)) {
      const tabId = sender.tab?.id;
      if (!isTrustedTabSender(sender) || tabId === undefined) {
        safeDebug('query rejected: untrusted sender', { url: sender.tab?.url });
        sendResponse({ ok: false, error: 'UNTRUSTED_SENDER' });
        return true;
      }
      if (!validateQueryPayload(message.payload)) {
        const fallbackId =
          typeof message.payload === 'object' &&
          message.payload &&
          'queryId' in message.payload
            ? String((message.payload as QueryPayload).queryId)
            : 'invalid';
        sendToken(tabId, {
          type: MESSAGE.TOKEN,
          queryId: fallbackId,
          error: ERROR_CODE.BAD_REQUEST,
          done: true,
        });
        sendResponse({ ok: false, error: 'INVALID_PAYLOAD' });
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

    if (
      typeof message === 'object' &&
      message !== null &&
      (message as { type: string }).type === MESSAGE.OPEN_SETTINGS
    ) {
      void chrome.action.openPopup();
      sendResponse({ ok: true });
      return true;
    }

    return false;
  });
}
