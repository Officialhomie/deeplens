import { isTokenMessage, type TokenMessage } from '../shared/types';
import { notifyStreamStarted } from './detector';

/** Phase 4–5: progressive token render into tooltip */
export function initStreamer(onToken?: (msg: TokenMessage) => void): void {
  chrome.runtime.onMessage.addListener((message) => {
    if (!isTokenMessage(message)) return;
    if (message.token) notifyStreamStarted();
    onToken?.(message);
    if (import.meta.env.DEV && message.error) {
      console.debug('[DeepLens] stream error:', message.error);
    }
  });
}
