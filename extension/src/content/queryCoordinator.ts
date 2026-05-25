import { buildQueryPayload } from '../shared/queryBuilder';
import { storage } from '../shared/storage';
import { getSessionId } from '../shared/session';
import { MESSAGE } from '../shared/types';
import type { QueryMode } from '../shared/types';
import { extractContext } from './extractor';
import { DEEPLENS_TRIGGER_EVENT } from './intent';
import type { TriggerPayload } from './detector';
import { getSessionMode, setSessionMode } from './sessionMode';
import { prepareStream } from './streamer';
import { DEEPLENS_MODE_CHANGE, tooltipState } from './tooltip';

let lastTrigger: TriggerPayload | null = null;

export function initQueryCoordinator(): void {
  document.addEventListener(DEEPLENS_TRIGGER_EVENT, (event) => {
    const trigger = (event as CustomEvent<TriggerPayload>).detail;
    lastTrigger = trigger;
    void handleTrigger(trigger);
  });

  document.addEventListener(DEEPLENS_MODE_CHANGE, (event) => {
    const { mode } = (event as CustomEvent<{ mode: QueryMode }>).detail;
    if (!lastTrigger || !tooltipState.extractedContext) return;
    void handleModeChange(mode);
  });
}

async function dispatchQuery(
  trigger: TriggerPayload,
  mode: QueryMode,
): Promise<void> {
  const context = extractContext(trigger);
  tooltipState.extractedContext = context;
  tooltipState.triggerMode = trigger.mode;

  const queryId = crypto.randomUUID();
  prepareStream(queryId, trigger.rect, trigger.text, mode);

  const payload = buildQueryPayload(
    context,
    mode,
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

function resolveMode(
  settings: Awaited<ReturnType<typeof storage.getPublicSettings>>,
): QueryMode {
  const session = getSessionMode();
  if (session) return session;
  return settings.defaultMode === 'links' ? 'deep' : settings.defaultMode;
}

async function handleTrigger(trigger: TriggerPayload): Promise<void> {
  const settings = await storage.getPublicSettings();
  await dispatchQuery(trigger, resolveMode(settings));
}

async function handleModeChange(mode: QueryMode): Promise<void> {
  if (!lastTrigger) return;
  setSessionMode(mode);
  chrome.runtime.sendMessage({ type: MESSAGE.ABORT }).catch(() => undefined);
  await dispatchQuery(lastTrigger, mode);
}
