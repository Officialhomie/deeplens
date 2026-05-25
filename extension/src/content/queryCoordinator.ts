import { ERROR_CODE } from '../shared/errors';
import { buildQueryPayload } from '../shared/queryBuilder';
import { getSessionId } from '../shared/session';
import { MESSAGE } from '../shared/types';
import type { QueryMode, QueryPayload } from '../shared/types';
import { extractContext } from './extractor';
import { DEEPLENS_TRIGGER_EVENT } from './intent';
import type { TriggerPayload } from './detector';
import {
  getCachedResponse,
  setCachedResponse,
} from './responseCache';
import { getCachedSettings } from './settingsCache';
import { getSessionMode, setSessionMode } from './sessionMode';
import { applyCachedResponse, prepareStream } from './streamer';
import { DEEPLENS_MODE_CHANGE, showTooltipError, tooltipState } from './tooltip';

let lastTrigger: TriggerPayload | null = null;
let lastPayload: QueryPayload | null = null;

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

function resolveMode(): QueryMode {
  const settings = getCachedSettings();
  const session = getSessionMode();
  if (session) return session;
  return settings.defaultMode === 'links' ? 'deep' : settings.defaultMode;
}


async function dispatchQuery(
  trigger: TriggerPayload,
  mode: QueryMode,
  options?: { skipCache?: boolean },
): Promise<void> {
  const context = extractContext(trigger);
  tooltipState.extractedContext = context;
  tooltipState.triggerMode = trigger.mode;

  if (!options?.skipCache) {
    const cached = getCachedResponse(
      trigger.text,
      mode,
      context.pageDomain,
    );
    if (cached) {
      applyCachedResponse(trigger, mode, cached.streamBuffer);
      return;
    }
  }

  const queryId = crypto.randomUUID();
  prepareStream(queryId, trigger.rect, trigger.text, mode);

  const payload = buildQueryPayload(
    context,
    mode,
    trigger.mode,
    getSessionId(),
    queryId,
  );
  lastPayload = payload;

  try {
    await chrome.runtime.sendMessage({
      type: MESSAGE.QUERY,
      payload,
    });
  } catch {
    showTooltipError(ERROR_CODE.CONNECTION_LOST);
  }
}

async function handleTrigger(trigger: TriggerPayload): Promise<void> {
  await dispatchQuery(trigger, resolveMode());
}

async function handleModeChange(mode: QueryMode): Promise<void> {
  if (!lastTrigger) return;
  setSessionMode(mode);
  chrome.runtime.sendMessage({ type: MESSAGE.ABORT }).catch(() => undefined);
  await dispatchQuery(lastTrigger, mode, { skipCache: true });
}

/** Re-send last query (TRD §10.2 / §10.3 recovery) */
export function retryLastQuery(): void {
  if (!lastTrigger || !lastPayload) return;
  const mode = lastPayload.mode;
  chrome.runtime.sendMessage({ type: MESSAGE.ABORT }).catch(() => undefined);
  void dispatchQuery(lastTrigger, mode, { skipCache: true });
}

export function rememberCompletedResponse(
  word: string,
  mode: QueryMode,
  pageDomain: string,
  streamBuffer: string,
): void {
  if (!streamBuffer.trim()) return;
  setCachedResponse(word, mode, pageDomain, streamBuffer);
}
