import { describe, expect, it } from 'vitest';
import { parseRetryAfter } from '../../src/shared/retryAfter';

describe('parseRetryAfter', () => {
  it('parses delay in seconds', () => {
    expect(parseRetryAfter('30')).toBe(30_000);
  });

  it('parses HTTP-date', () => {
    const future = new Date(Date.now() + 5000).toUTCString();
    const ms = parseRetryAfter(future);
    expect(ms).toBeGreaterThan(4000);
    expect(ms).toBeLessThanOrEqual(5000);
  });

  it('returns undefined for empty header', () => {
    expect(parseRetryAfter(null)).toBeUndefined();
    expect(parseRetryAfter('')).toBeUndefined();
  });
});
