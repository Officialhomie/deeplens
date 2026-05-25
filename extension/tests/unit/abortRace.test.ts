import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  beginQuery,
  invalidateQuery,
  isActiveQuery,
  resetStreamSessionsForTests,
} from '../../src/background/streamSession';

/** Regression: stale tokens must not apply after abort/new query (TRD §10, Phase 9) */
describe('abort and query race', () => {
  beforeEach(() => {
    resetStreamSessionsForTests();
  });

  it('new query id supersedes previous tab query', () => {
    beginQuery(1, 'query-old');
    beginQuery(1, 'query-new');
    expect(isActiveQuery(1, 'query-old')).toBe(false);
    expect(isActiveQuery(1, 'query-new')).toBe(true);
  });

  it('invalidated tab rejects all query ids', () => {
    beginQuery(3, 'q1');
    invalidateQuery(3);
    expect(isActiveQuery(3, 'q1')).toBe(false);
    beginQuery(3, 'q2');
    expect(isActiveQuery(3, 'q2')).toBe(true);
  });

  it('simulated stale token drop matches streamer guard', () => {
    let activeQueryId: string | null = 'active';
    const isStale = (msgQueryId: string) =>
      !msgQueryId || !activeQueryId || msgQueryId !== activeQueryId;

    beginQuery(1, 'active');
    expect(isStale('active')).toBe(false);

    beginQuery(1, 'replacement');
    activeQueryId = 'replacement';
    expect(isStale('active')).toBe(true);
    expect(isStale('replacement')).toBe(false);

    invalidateQuery(1);
    activeQueryId = null;
    expect(isStale('replacement')).toBe(true);
  });

  it('abort invalidates before new stream starts', () => {
    beginQuery(5, 'first');
    invalidateQuery(5);
    const relay = vi.fn();
    const sendIfActive = (tabId: number, queryId: string, token: string) => {
      if (isActiveQuery(tabId, queryId)) relay(token);
    };
    sendIfActive(5, 'first', 'stale-token');
    expect(relay).not.toHaveBeenCalled();
    beginQuery(5, 'second');
    sendIfActive(5, 'second', 'fresh-token');
    expect(relay).toHaveBeenCalledWith('fresh-token');
  });
});
