import { describe, expect, it } from 'vitest';
import {
  buildQueryPayload,
  resolveQueryMode,
} from '../../src/shared/queryBuilder';

const sampleContext = {
  selectedText: 'term',
  sentenceContext: 'A sentence with term.',
  paragraphContext: 'Paragraph text.',
  headingContext: 'Section',
  pageTitle: 'Page',
  pageURL: 'https://example.com',
  pageDomain: 'example.com',
  domainCategory: 'general' as const,
};

describe('queryBuilder', () => {
  it('resolves links mode to deep for v1', () => {
    expect(resolveQueryMode('links')).toBe('deep');
    expect(resolveQueryMode('quick')).toBe('quick');
  });

  it('builds query payload with session and trigger mode', () => {
    const payload = buildQueryPayload(
      sampleContext,
      'quick',
      'hover',
      'session-abc',
      'query-xyz',
    );
    expect(payload.queryId).toBe('query-xyz');
    expect(payload.mode).toBe('quick');
    expect(payload.triggeredBy).toBe('hover');
    expect(payload.sessionId).toBe('session-abc');
    expect(payload.context.selectedText).toBe('term');
  });
});
