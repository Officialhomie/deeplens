import { initDetector } from './detector';
import { initStreamer } from './streamer';
import { initTooltip } from './tooltip';

function boot(): void {
  initDetector();
  initStreamer();
  initTooltip();

  if (import.meta.env.DEV) {
    console.debug('[DeepLens] content script ready');
  }
}

boot();
