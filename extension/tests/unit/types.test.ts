import { describe, expect, it } from 'vitest';
import {
  isAbortMessage,
  isQueryMessage,
  isTokenMessage,
  MESSAGE,
} from '../../src/shared/types';

describe('message type guards', () => {
  it('recognizes query messages', () => {
    expect(
      isQueryMessage({
        type: MESSAGE.QUERY,
        payload: {
          mode: 'quick',
          triggeredBy: 'hover',
          sessionId: 'abc',
          context: {
            selectedText: 'test',
            sentenceContext: '',
            paragraphContext: '',
            headingContext: null,
            pageTitle: 'T',
            pageURL: 'https://x.com',
            pageDomain: 'x.com',
            domainCategory: 'general',
          },
        },
      }),
    ).toBe(true);
    expect(isQueryMessage({ type: 'OTHER' })).toBe(false);
  });

  it('recognizes abort messages', () => {
    expect(isAbortMessage({ type: MESSAGE.ABORT })).toBe(true);
  });

  it('recognizes token messages', () => {
    expect(
      isTokenMessage({ type: MESSAGE.TOKEN, token: 'hi', done: false }),
    ).toBe(true);
  });
});
