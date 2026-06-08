/** Popup settings helpers */
import type { LLMProvider } from '../shared/types';

export const PROVIDER_LABELS: Record<LLMProvider, string> = {
  anthropic: 'Anthropic (Claude)',
  gemini: 'Google Gemini (free)',
  groq: 'Groq (free)',
  openrouter: 'OpenRouter',
};

export const PROVIDER_KEY_PLACEHOLDERS: Record<LLMProvider, string> = {
  anthropic: 'sk-ant-…',
  gemini: 'AIza…',
  groq: 'gsk_…',
  openrouter: 'sk-or-…',
};

export const PROVIDER_KEY_HINTS: Record<LLMProvider, string> = {
  anthropic: 'console.anthropic.com',
  gemini: 'aistudio.google.com (free)',
  groq: 'console.groq.com (free)',
  openrouter: 'openrouter.ai/keys',
};

export function validateApiKeyFormat(key: string, provider: LLMProvider): boolean {
  const trimmed = key.trim();
  if (trimmed.length < 10) return false;
  switch (provider) {
    case 'anthropic':
      return trimmed.startsWith('sk-ant') && trimmed.length >= 20;
    case 'gemini':
      return trimmed.startsWith('AIza') && trimmed.length >= 20;
    case 'groq':
      return trimmed.startsWith('gsk_') && trimmed.length >= 20;
    case 'openrouter':
      return trimmed.startsWith('sk-or-') && trimmed.length >= 20;
    default:
      return trimmed.length >= 10;
  }
}

export function maskApiKeyHint(hasKey: boolean): string {
  return hasKey ? 'Key saved locally' : 'Paste your API key here';
}

export function clampHoverDelay(ms: number): number {
  return Math.min(800, Math.max(200, Math.round(ms / 50) * 50));
}
