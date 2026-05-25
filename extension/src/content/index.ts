import { initIntentEngine } from './intent';
import { initQueryCoordinator } from './queryCoordinator';
import { initSettingsCache } from './settingsCache';
import { initStreamer } from './streamer';
import { initTooltip } from './tooltip';

async function boot(): Promise<void> {
  await initSettingsCache();
  initIntentEngine();
  initQueryCoordinator();
  initStreamer();
  initTooltip();

  if (import.meta.env.DEV) {
    console.debug('[DeepLens] content script ready');
  }
}

void boot();
