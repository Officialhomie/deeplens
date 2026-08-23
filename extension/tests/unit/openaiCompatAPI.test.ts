import { describe, expect, it } from 'vitest';
import {
  extractStreamDeltaText,
  parseRateLimitDelayMs,
} from '../../src/background/openaiCompatAPI';

describe('extractStreamDeltaText', () => {
  it('returns content field when present', () => {
    expect(extractStreamDeltaText({ content: 'hello' })).toBe('hello');
  });

  it('falls back to text field', () => {
    expect(extractStreamDeltaText({ text: 'fallback' })).toBe('fallback');
  });

  it('prefers content over text', () => {
    expect(extractStreamDeltaText({ content: 'c', text: 't' })).toBe('c');
  });

  it('ignores empty strings and reasoning-only deltas', () => {
    expect(extractStreamDeltaText({ content: '' })).toBe('');
    expect(
      extractStreamDeltaText({ reasoning: 'hidden', reasoning_content: 'x' }),
    ).toBe('');
    expect(extractStreamDeltaText(undefined)).toBe('');
  });
});

describe('parseRateLimitDelayMs', () => {
  it('reads Retry-After header in seconds', async () => {
    const response = new Response(null, {
      headers: { 'Retry-After': '30' },
    });
    expect(await parseRateLimitDelayMs(response)).toBe(30_000);
  });

  it('reads OpenRouter metadata.retry_after_ms from body', async () => {
    const response = new Response(
      JSON.stringify({
        error: { metadata: { retry_after_ms: 5000 } },
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
    expect(await parseRateLimitDelayMs(response)).toBe(5000);
  });
});
