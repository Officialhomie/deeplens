import { describe, expect, it } from 'vitest';
import { buildUserMessage, SYSTEM_PROMPTS } from '../../src/background/prompts';

describe('prompts', () => {
  it('has non-empty system prompts for all modes', () => {
    for (const mode of ['quick', 'deep', 'links'] as const) {
      expect(SYSTEM_PROMPTS[mode].length).toBeGreaterThan(50);
    }
  });

  it('buildUserMessage injects context fields', () => {
    const msg = buildUserMessage({
      selectedText: 'eigenvalue',
      sentenceContext: 'The eigenvalue is central.',
      paragraphContext: '',
      headingContext: null,
      pageTitle: 'Linear Algebra',
      pageURL: 'https://example.com',
      pageDomain: 'example.com',
      domainCategory: 'academic',
    });
    expect(msg).toContain('eigenvalue');
    expect(msg).toContain('Linear Algebra');
    expect(msg).toContain('academic');
  });
});
