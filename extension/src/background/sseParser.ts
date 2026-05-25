/** Anthropic SSE event parsing (TRD §5.2) */

export interface SSEParserHandlers {
  onTextDelta: (text: string) => void;
  onDone: () => void;
}

export function createSSEParser(handlers: SSEParserHandlers): {
  feed: (chunk: string) => void;
} {
  let buffer = '';

  const processLine = (line: string): void => {
    if (!line.startsWith('data: ')) return;
    const data = line.slice(6).trim();
    if (!data || data === '[DONE]') {
      handlers.onDone();
      return;
    }
    try {
      const parsed = JSON.parse(data) as {
        type?: string;
        delta?: { type?: string; text?: string; text_delta?: string };
      };
      if (parsed.type === 'message_stop') {
        handlers.onDone();
        return;
      }
      if (parsed.type === 'content_block_delta') {
        const text =
          parsed.delta?.text ??
          (parsed.delta?.type === 'text_delta' ? parsed.delta.text : undefined);
        if (text) handlers.onTextDelta(text);
      }
    } catch {
      /* skip malformed */
    }
  };

  return {
    feed(chunk: string) {
      buffer += chunk;
      const blocks = buffer.split(/\n\n/);
      buffer = blocks.pop() ?? '';
      for (const block of blocks) {
        for (const line of block.split('\n')) {
          processLine(line);
        }
      }
    },
  };
}

/** Test helper — parse a single SSE data line */
export function parseSSEDataLine(data: string): {
  text: string | null;
  done: boolean;
} {
  if (data === '[DONE]') return { text: null, done: true };
  try {
    const parsed = JSON.parse(data) as {
      type?: string;
      delta?: { text?: string };
    };
    if (parsed.type === 'message_stop') return { text: null, done: true };
    if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
      return { text: parsed.delta.text, done: false };
    }
  } catch {
    /* ignore */
  }
  return { text: null, done: false };
}
