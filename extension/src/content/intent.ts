import { MESSAGE } from '../shared/types';
import { initDetector, type TriggerPayload } from './detector';
import { getCachedSettings } from './settingsCache';

export const DEEPLENS_TRIGGER_EVENT = 'deeplens:trigger';

declare global {
  interface DocumentEventMap {
    'deeplens:trigger': CustomEvent<TriggerPayload>;
  }
}

function sendAbort(): void {
  document.dispatchEvent(new CustomEvent('deeplens:abort'));
  chrome.runtime.sendMessage({ type: MESSAGE.ABORT }).catch(() => {
    /* service worker may be asleep */
  });
}

function dispatchTrigger(payload: TriggerPayload): void {
  document.dispatchEvent(
    new CustomEvent(DEEPLENS_TRIGGER_EVENT, { detail: payload }),
  );
}

export function initIntentEngine(): () => void {
  return initDetector({
    getConfig: async () => {
      const settings = getCachedSettings();
      return {
        hoverDelayMs: settings.hoverDelayMs,
        hoverEnabled: settings.hoverEnabled,
        selectionEnabled: settings.selectionEnabled,
        isEnabled: settings.isEnabled,
        blacklistedDomains: settings.blacklistedDomains,
      };
    },
    onAbort: sendAbort,
    onTrigger: dispatchTrigger,
  });
}
