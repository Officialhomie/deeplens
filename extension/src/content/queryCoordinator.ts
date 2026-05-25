import { buildQueryPayload } from '../shared/queryBuilder';
import { storage } from '../shared/storage';
import { getSessionId } from '../shared/session';
import { MESSAGE } from '../shared/types';
import { extractContext } from './extractor';
import { DEEPLENS_TRIGGER_EVENT } from './intent';
import type { TriggerPayload } from './detector';
import { prepareStream } from './streamer';

export function initQueryCoordinator(): void {
  document.addEventListener(DEEPLENS_TRIGGER_EVENT, (event) => {
    const trigger = (event as CustomEvent<TriggerPayload>).detail;
    void handleTrigger(trigger);
  });
}

async function handleTrigger(trigger: TriggerPayload): Promise<void> {
  const context = extractContext(trigger);
  const settings = await storage.getPublicSettings();
  const queryId = crypto.randomUUID();
  const mode = settings.defaultMode === 'links' ? 'deep' : settings.defaultMode;

  prepareStream(queryId, trigger.rect, trigger.text, mode);

  const payload = buildQueryPayload(
    context,
    settings.defaultMode,
    trigger.mode,
    getSessionId(),
    queryId,
  );

  try {
    await chrome.runtime.sendMessage({
      type: MESSAGE.QUERY,
      payload,
    });
  } catch (err) {
    if (import.meta.env.DEV) {
      console.debug('[DeepLens] query dispatch failed', err);
    }
  }
}
