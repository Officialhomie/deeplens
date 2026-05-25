import { beforeEach, describe, expect, it } from 'vitest';
import {
  checkSessionRateLimit,
  resetRateLimiterForTests,
  sessionQueryCount,
} from '../../src/background/rateLimiter';

describe('rateLimiter', () => {
  beforeEach(() => {
    resetRateLimiterForTests();
  });

  it('allows queries under the cap', () => {
    for (let i = 0; i < 30; i++) {
      expect(checkSessionRateLimit()).toBe(true);
    }
    expect(sessionQueryCount()).toBe(30);
  });

  it('blocks after 30 queries in window', () => {
    for (let i = 0; i < 30; i++) checkSessionRateLimit();
    expect(checkSessionRateLimit()).toBe(false);
  });
});
