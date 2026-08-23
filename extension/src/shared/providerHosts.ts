/**
 * Provider → host permission mapping.
 *
 * These origins live in `optional_host_permissions`, not `host_permissions`:
 * the extension requests only the origin for the provider the user actually
 * chose, at the moment they choose it. Nothing is granted at install time.
 */
import type { LLMProvider } from './types';

export const PROVIDER_ORIGINS: Record<LLMProvider, string> = {
  anthropic: 'https://api.anthropic.com/*',
  gemini: 'https://generativelanguage.googleapis.com/*',
  groq: 'https://api.groq.com/*',
  openrouter: 'https://openrouter.ai/*',
};

export const ALL_PROVIDER_ORIGINS: string[] = Object.values(PROVIDER_ORIGINS);

export function originForProvider(provider: LLMProvider): string {
  return PROVIDER_ORIGINS[provider];
}

function permissionsApi(): typeof chrome.permissions | null {
  if (typeof chrome === 'undefined' || !chrome.permissions) return null;
  return chrome.permissions;
}

/** Whether the host permission for `provider` is currently granted. */
export async function hasProviderPermission(
  provider: LLMProvider,
): Promise<boolean> {
  const api = permissionsApi();
  if (!api) return false;
  return api.contains({ origins: [originForProvider(provider)] });
}

/**
 * Request the host permission for `provider`.
 * MUST be called from a user gesture (click/change handler) or Chrome rejects it.
 * Resolves false when the user declines.
 */
export async function requestProviderPermission(
  provider: LLMProvider,
): Promise<boolean> {
  const api = permissionsApi();
  if (!api) return false;
  try {
    return await api.request({ origins: [originForProvider(provider)] });
  } catch {
    return false;
  }
}

/**
 * Drop host permissions for every provider except `keep`.
 * The extension uses exactly one provider at a time, so holding grants for
 * the others is unnecessary standing access.
 */
export async function pruneProviderPermissions(
  keep: LLMProvider,
): Promise<void> {
  const api = permissionsApi();
  if (!api) return;
  const keepOrigin = originForProvider(keep);
  const stale = ALL_PROVIDER_ORIGINS.filter((o) => o !== keepOrigin);
  for (const origin of stale) {
    try {
      if (await api.contains({ origins: [origin] })) {
        await api.remove({ origins: [origin] });
      }
    } catch {
      /* removal is best-effort cleanup — never block the user on it */
    }
  }
}
