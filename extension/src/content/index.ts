import { initIntentEngine } from './intent';
import { initQueryCoordinator } from './queryCoordinator';
import { initStreamer } from './streamer';
import { initTooltip } from './tooltip';

function boot(): void {
  initIntentEngine();
  initQueryCoordinator();
  initStreamer();
  initTooltip();

  if (import.meta.env.DEV) {
    console.debug('[DeepLens] content script ready');
  }
}

boot();
