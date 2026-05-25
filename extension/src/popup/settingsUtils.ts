/** Popup settings helpers (Phase 6) */

export function validateApiKeyFormat(key: string): boolean {
  const trimmed = key.trim();
  if (trimmed.length < 20) return false;
  return trimmed.startsWith('sk-ant');
}

export function maskApiKeyHint(hasKey: boolean): string {
  return hasKey ? 'Key saved locally' : 'Paste sk-ant-api-key here';
}

export function clampHoverDelay(ms: number): number {
  return Math.min(800, Math.max(200, Math.round(ms / 50) * 50));
}
