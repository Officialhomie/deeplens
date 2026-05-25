import type { QueryMode } from './types';

export interface DeepLensStorage {
  apiKey: string;
  defaultMode: QueryMode;
  hoverDelayMs: number;
  hoverEnabled: boolean;
  selectionEnabled: boolean;
  blacklistedDomains: string[];
  isEnabled: boolean;
  outputLanguage: string;
  installedAt: number;
  onboardingComplete: boolean;
}

export type PublicSettings = Omit<DeepLensStorage, 'apiKey'>;

const DEFAULTS: DeepLensStorage = {
  apiKey: '',
  defaultMode: 'deep',
  hoverDelayMs: 300,
  hoverEnabled: true,
  selectionEnabled: true,
  blacklistedDomains: [],
  isEnabled: true,
  outputLanguage: 'en',
  installedAt: Date.now(),
  onboardingComplete: false,
};

function chromeStorage(): chrome.storage.LocalStorageArea {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    throw new Error('chrome.storage.local is not available in this context');
  }
  return chrome.storage.local;
}

export const storage = {
  async get<K extends keyof DeepLensStorage>(
    key: K,
  ): Promise<DeepLensStorage[K]> {
    const result = await chromeStorage().get(key);
    const value = result[key];
    return (value !== undefined ? value : DEFAULTS[key]) as DeepLensStorage[K];
  },

  async set<K extends keyof DeepLensStorage>(
    key: K,
    value: DeepLensStorage[K],
  ): Promise<void> {
    await chromeStorage().set({ [key]: value });
  },

  async getAll(): Promise<DeepLensStorage> {
    const stored = await chromeStorage().get(null);
    return { ...DEFAULTS, ...stored } as DeepLensStorage;
  },

  /** Settings safe for content script (never includes apiKey). */
  async getPublicSettings(): Promise<PublicSettings> {
    const all = await this.getAll();
    const { apiKey: _removed, ...publicSettings } = all;
    return publicSettings;
  },

  defaults(): DeepLensStorage {
    return { ...DEFAULTS };
  },
};
