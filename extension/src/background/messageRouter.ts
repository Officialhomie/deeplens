import { streamClaudeResponse } from './claudeAPI';
import { storage } from '../shared/storage';
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
    token?: string;
    done?: boolean;
    error?: string;
  },
): void {
  chrome.tabs.sendMessage(tabId, msg).catch(() => {
    /* tab may have closed */
  });
}

async function handleQuery(payload: QueryPayload, tabId: number): Promise<void> {
  currentAbortController?.abort();
  currentAbortController = new AbortController();
  const signal = currentAbortController.signal;

  const apiKey = await storage.get('apiKey');
  if (!apiKey.trim()) {
    sendToken(tabId, {
      type: MESSAGE.TOKEN,
      error: 'NO_API_KEY',
      done: true,
    });
    return;
  }

  await streamClaudeResponse(apiKey, payload, signal, (msg) => {
    sendToken(tabId, msg);
  });
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
      sendResponse({ ok: true });
      return true;
    }

    return false;
  });
}
