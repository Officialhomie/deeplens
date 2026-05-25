import { storage, type PublicSettings } from '../shared/storage';

let cached: PublicSettings | null = null;

function defaultsPublic(): PublicSettings {
  const all = storage.defaults();
  const { apiKey: _removed, ...pub } = all;
  return pub;
}

export async function initSettingsCache(): Promise<void> {
  cached = await storage.getPublicSettings();
  if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local') return;
      const keys = Object.keys(changes) as Array<keyof PublicSettings>;
      if (keys.some((k) => k !== 'apiKey')) {
        void refreshSettingsCache();
      }
    });
  }
}

export async function refreshSettingsCache(): Promise<void> {
  cached = await storage.getPublicSettings();
}

/** Fast path for hot paths (detector mouseover) — TRD §9.2 */
export function getCachedSettings(): PublicSettings {
  return cached ?? defaultsPublic();
}

export function resetSettingsCacheForTests(): void {
  cached = null;
}
