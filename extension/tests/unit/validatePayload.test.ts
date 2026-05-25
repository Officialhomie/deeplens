import { describe, expect, it } from 'vitest';
import type { QueryPayload } from '../../src/shared/types';
import {
  assertPayloadHasNoSecrets,
  validateQueryPayload,
} from '../../src/shared/validatePayload';

function validPayload(overrides: Partial<QueryPayload> = {}): QueryPayload {
  return {
    mode: 'quick',
    triggeredBy: 'hover',
    sessionId: 'sess-abc',
    queryId: 'query-xyz',
    context: {
      selectedText: 'blockchain',
      sentenceContext: 'The word blockchain appears here.',
      paragraphContext: 'A short paragraph.',
      headingContext: 'Intro',
      pageTitle: 'Example Page',
      pageURL: 'https://example.com/article',
      pageDomain: 'example.com',
      domainCategory: 'technical',
    },
    ...overrides,
  };
}

describe('validateQueryPayload', () => {
  it('accepts a well-formed payload', () => {
    expect(validateQueryPayload(validPayload())).toBe(true);
  });

  it('rejects invalid mode', () => {
    expect(
      validateQueryPayload(
        validPayload({ mode: 'invalid' as QueryPayload['mode'] }),
      ),
    ).toBe(false);
  });

  it('rejects empty selectedText', () => {
    const p = validPayload();
    p.context.selectedText = '';
    expect(validateQueryPayload(p)).toBe(false);
  });

  it('rejects oversize selectedText', () => {
    const p = validPayload();
    p.context.selectedText = 'x'.repeat(501);
    expect(validateQueryPayload(p)).toBe(false);
  });

  it('rejects API key material in payload', () => {
    const p = validPayload();
    p.context.sentenceContext = 'leaked sk-ant-api03-abcdefghijklmnopqrstuvwxyz';
    expect(validateQueryPayload(p)).toBe(false);
    expect(() => assertPayloadHasNoSecrets(p)).toThrow();
  });
});
