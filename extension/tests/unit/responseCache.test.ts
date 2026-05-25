import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getCachedResponse,
  resetResponseCacheForTests,
  RESPONSE_CACHE_TTL_MS,
  setCachedResponse,
} from '../../src/content/responseCache';

describe('responseCache', () => {
  beforeEach(() => {
    resetResponseCacheForTests();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns cached entry within TTL for same word/mode/domain', () => {
    setCachedResponse('term', 'quick', 'example.com', 'cached body');
    const hit = getCachedResponse('term', 'quick', 'example.com');
    expect(hit?.streamBuffer).toBe('cached body');
  });

  it('misses after TTL expires', () => {
    setCachedResponse('term', 'quick', 'example.com', 'body');
    vi.advanceTimersByTime(RESPONSE_CACHE_TTL_MS + 1);
    expect(getCachedResponse('term', 'quick', 'example.com')).toBeNull();
  });

  it('misses when word or mode differs', () => {
    setCachedResponse('alpha', 'quick', 'example.com', 'body');
    expect(getCachedResponse('beta', 'quick', 'example.com')).toBeNull();
    expect(getCachedResponse('alpha', 'deep', 'example.com')).toBeNull();
  });
});
