import { describe, expect, it } from 'vitest';
import { redactSecrets } from '../../src/shared/safeLog';

const KEYS: Array<[string, string]> = [
  ['anthropic', 'sk-ant-api03-abcdefghijklmnopqrstuvwxyz'],
  ['openrouter', 'sk-or-v1-abcdefghijklmnopqrstuvwxyz0123'],
  ['groq', 'gsk_abcdefghijklmnopqrstuvwxyz0123456789'],
  ['gemini', 'AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ0123456'],
];

describe('safeLog', () => {
  it.each(KEYS)('redacts %s-style keys in strings', (_provider, key) => {
    const out = redactSecrets(`key=${key} end`);
    expect(out).toContain('[REDACTED]');
    expect(out).not.toContain(key);
  });

  it('redacts every provider key present in one string', () => {
    const out = redactSecrets(KEYS.map(([, k]) => k).join(' | '));
    for (const [, key] of KEYS) {
      expect(out).not.toContain(key);
    }
  });

  it('leaves ordinary text untouched', () => {
    expect(redactSecrets('the quick brown fox')).toBe('the quick brown fox');
  });
});
