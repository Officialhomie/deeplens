import { MESSAGE } from '../shared/types';
import { initDetector, type TriggerPayload } from './detector';
import { getCachedSettings } from './settingsCache';
import { tooltipState } from './tooltip';

export const DEEPLENS_TRIGGER_EVENT = 'deeplens:trigger';

declare global {
  interface DocumentEventMap {
    'deeplens:trigger': CustomEvent<TriggerPayload>;
  }
}

/** Cancel in-flight query but keep tooltip (new trigger incoming). */
function sendSoftAbort(): void {
  document.dispatchEvent(new CustomEvent('deeplens:soft-abort'));
  chrome.runtime.sendMessage({ type: MESSAGE.ABORT }).catch(() => {
    /* service worker may be asleep */
  });
}

/** Dismiss tooltip (user left before stream started). */
function sendHardAbort(): void {
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
    onAbort: sendHardAbort,
    onSoftAbort: sendSoftAbort,
    onTrigger: dispatchTrigger,
    shouldSuppressHover: () =>
      tooltipState.isVisible && tooltipState.triggerMode === 'select',
  });
}
