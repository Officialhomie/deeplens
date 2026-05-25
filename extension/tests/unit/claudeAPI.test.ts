import { describe, expect, it } from 'vitest';
import { buildClaudeRequest, MAX_TOKENS } from '../../src/background/claudeAPI';

const baseContext = {
  selectedText: 'term',
  sentenceContext: 'A sentence.',
  paragraphContext: '',
  headingContext: null,
  pageTitle: 'Page',
  pageURL: 'https://a.com',
  pageDomain: 'a.com',
  domainCategory: 'general' as const,
};

describe('claudeAPI', () => {
  it('sets token limits per mode', () => {
    expect(
      buildClaudeRequest({
        mode: 'quick',
        context: baseContext,
        triggeredBy: 'hover',
        sessionId: '1',
        queryId: 'q1',
      }).max_tokens,
    ).toBe(MAX_TOKENS.quick);

    expect(
      buildClaudeRequest({
        mode: 'deep',
        context: baseContext,
        triggeredBy: 'select',
        sessionId: '1',
        queryId: 'q1',
      }).max_tokens,
    ).toBe(MAX_TOKENS.deep);
  });

  it('enables streaming and includes system prompt', () => {
    const req = buildClaudeRequest({
      mode: 'deep',
      context: baseContext,
      triggeredBy: 'hover',
      sessionId: '1',
      queryId: 'q1',
    });
    expect(req.stream).toBe(true);
    expect(req.system).toContain('DeepLens');
    expect(req.messages[0].content).toContain('term');
  });
});
