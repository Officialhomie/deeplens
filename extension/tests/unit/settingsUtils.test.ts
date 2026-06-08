import { describe, expect, it } from 'vitest';
import {
  clampHoverDelay,
  validateApiKeyFormat,
} from '../../src/popup/settingsUtils';

describe('settingsUtils', () => {
  it('validates Anthropic key prefix and length', () => {
    expect(validateApiKeyFormat('sk-ant-api03-short', 'anthropic')).toBe(false);
    expect(
      validateApiKeyFormat('sk-ant-api03-abcdefghijklmnopqrstuvwxyz', 'anthropic'),
    ).toBe(true);
    expect(validateApiKeyFormat('invalid-key', 'anthropic')).toBe(false);
  });

  it('validates Gemini key prefix', () => {
    expect(validateApiKeyFormat('AIzaSyAbcdefghijklmnopqrstuvwx', 'gemini')).toBe(true);
    expect(validateApiKeyFormat('sk-ant-wrong', 'gemini')).toBe(false);
  });

  it('validates Groq key prefix', () => {
    expect(validateApiKeyFormat('gsk_abcdefghijklmnopqrstuvwxyz123456', 'groq')).toBe(true);
    expect(validateApiKeyFormat('sk-ant-wrong', 'groq')).toBe(false);
  });

  it('validates OpenRouter key prefix', () => {
    expect(validateApiKeyFormat('sk-or-abcdefghijklmnopqrstuvwxyz', 'openrouter')).toBe(true);
    expect(validateApiKeyFormat('sk-ant-wrong', 'openrouter')).toBe(false);
  });

  it('clamps hover delay to 200–800 in 50ms steps', () => {
    expect(clampHoverDelay(150)).toBe(200);
    expect(clampHoverDelay(325)).toBe(350);
    expect(clampHoverDelay(900)).toBe(800);
  });
});
