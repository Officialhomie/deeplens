import { describe, expect, it, vi } from 'vitest';
import { createSSEParser, parseSSEDataLine } from '../../src/background/sseParser';

describe('parseSSEDataLine', () => {
  it('extracts text from content_block_delta', () => {
    const data = JSON.stringify({
      type: 'content_block_delta',
      index: 0,
      delta: { type: 'text_delta', text: 'Hello' },
    });
    expect(parseSSEDataLine(data)).toEqual({ text: 'Hello', done: false });
  });

  it('marks message_stop as done', () => {
    const data = JSON.stringify({ type: 'message_stop' });
    expect(parseSSEDataLine(data)).toEqual({ text: null, done: true });
  });
});

describe('createSSEParser', () => {
  it('feeds multi-line SSE chunks', () => {
    const deltas: string[] = [];
    const done = vi.fn();
    const parser = createSSEParser({
      onTextDelta: (t) => deltas.push(t),
      onDone: done,
    });

    const block = [
      'event: content_block_delta',
      'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hi"}}',
      '',
      'event: message_stop',
      'data: {"type":"message_stop"}',
      '',
    ].join('\n\n');

    parser.feed(block);
    expect(deltas).toEqual(['Hi']);
    expect(done).toHaveBeenCalled();
  });
});
