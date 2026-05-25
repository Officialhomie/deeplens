import { initIntentEngine } from './intent';
import { initStreamer } from './streamer';
import { initTooltip } from './tooltip';

function boot(): void {
  initIntentEngine();
  initStreamer();
  initTooltip();

  if (import.meta.env.DEV) {
    console.debug('[DeepLens] content script ready');
  }
}

boot();
