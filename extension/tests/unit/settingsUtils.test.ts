import { describe, expect, it } from 'vitest';
import {
  clampHoverDelay,
  validateApiKeyFormat,
} from '../../src/popup/settingsUtils';

describe('settingsUtils', () => {
  it('validates Anthropic key prefix and length', () => {
    expect(validateApiKeyFormat('sk-ant-api03-short')).toBe(false);
    expect(
      validateApiKeyFormat('sk-ant-api03-abcdefghijklmnopqrstuvwxyz'),
    ).toBe(true);
    expect(validateApiKeyFormat('invalid-key')).toBe(false);
  });

  it('clamps hover delay to 200–800 in 50ms steps', () => {
    expect(clampHoverDelay(150)).toBe(200);
    expect(clampHoverDelay(325)).toBe(350);
    expect(clampHoverDelay(900)).toBe(800);
  });
});
