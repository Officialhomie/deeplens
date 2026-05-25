import { beforeEach, describe, expect, it } from 'vitest';
import {
  beginQuery,
  invalidateQuery,
  isActiveQuery,
  resetStreamSessionsForTests,
} from '../../src/background/streamSession';

describe('streamSession', () => {
  beforeEach(() => {
    resetStreamSessionsForTests();
  });

  it('tracks active query per tab', () => {
    beginQuery(1, 'q-a');
    expect(isActiveQuery(1, 'q-a')).toBe(true);
    expect(isActiveQuery(1, 'q-b')).toBe(false);
  });

  it('invalidates on abort', () => {
    beginQuery(2, 'q-old');
    invalidateQuery(2);
    expect(isActiveQuery(2, 'q-old')).toBe(false);
  });
});
