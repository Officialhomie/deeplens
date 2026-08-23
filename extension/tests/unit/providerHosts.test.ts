import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ALL_PROVIDER_ORIGINS,
  hasProviderPermission,
  originForProvider,
  pruneProviderPermissions,
  requestProviderPermission,
} from '../../src/shared/providerHosts';
import type { LLMProvider } from '../../src/shared/types';

const PROVIDERS: LLMProvider[] = ['anthropic', 'gemini', 'groq', 'openrouter'];

/** Stand-in for chrome.permissions backed by a granted-origin set. */
function stubPermissions(granted: string[] = []) {
  const set = new Set(granted);
  const api = {
    contains: vi.fn(({ origins }: { origins: string[] }) =>
      Promise.resolve(origins.every((o) => set.has(o))),
    ),
    request: vi.fn(({ origins }: { origins: string[] }) => {
      origins.forEach((o) => set.add(o));
      return Promise.resolve(true);
    }),
    remove: vi.fn(({ origins }: { origins: string[] }) => {
      origins.forEach((o) => set.delete(o));
      return Promise.resolve(true);
    }),
  };
  vi.stubGlobal('chrome', { ...globalThis.chrome, permissions: api });
  return { api, set };
}

describe('providerHosts', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps every provider to a distinct https origin', () => {
    const origins = PROVIDERS.map(originForProvider);
    expect(new Set(origins).size).toBe(PROVIDERS.length);
    for (const origin of origins) {
      expect(origin.startsWith('https://')).toBe(true);
    }
    expect(ALL_PROVIDER_ORIGINS).toHaveLength(PROVIDERS.length);
  });

  it('reports a granted provider permission', async () => {
    stubPermissions([originForProvider('groq')]);
    await expect(hasProviderPermission('groq')).resolves.toBe(true);
    await expect(hasProviderPermission('gemini')).resolves.toBe(false);
  });

  it('requests only the selected provider origin', async () => {
    const { api } = stubPermissions();
    await expect(requestProviderPermission('gemini')).resolves.toBe(true);
    expect(api.request).toHaveBeenCalledWith({
      origins: [originForProvider('gemini')],
    });
    expect(api.request).toHaveBeenCalledTimes(1);
  });

  it('resolves false when the user declines', async () => {
    stubPermissions();
    vi.stubGlobal('chrome', {
      ...globalThis.chrome,
      permissions: {
        contains: vi.fn(() => Promise.resolve(false)),
        request: vi.fn(() => Promise.resolve(false)),
        remove: vi.fn(() => Promise.resolve(true)),
      },
    });
    await expect(requestProviderPermission('anthropic')).resolves.toBe(false);
  });

  it('drops every provider origin except the one in use', async () => {
    const { set } = stubPermissions([...ALL_PROVIDER_ORIGINS]);
    await pruneProviderPermissions('openrouter');
    expect([...set]).toEqual([originForProvider('openrouter')]);
  });

  it('degrades safely when chrome.permissions is unavailable', async () => {
    vi.stubGlobal('chrome', {});
    await expect(hasProviderPermission('groq')).resolves.toBe(false);
    await expect(requestProviderPermission('groq')).resolves.toBe(false);
    await expect(pruneProviderPermissions('groq')).resolves.toBeUndefined();
  });
});
