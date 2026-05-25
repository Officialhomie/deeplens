import { createSSEParser } from './sseParser';
import { buildUserMessage, SYSTEM_PROMPTS } from './prompts';
import { ERROR_CODE, mapHttpError } from '../shared/errors';
import { parseRetryAfter } from '../shared/retryAfter';
import type { QueryMode, QueryPayload } from '../shared/types';
import { MESSAGE } from '../shared/types';

export const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
export const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export interface ClaudeRequest {
  model: string;
  max_tokens: number;
  stream: true;
  system: string;
  messages: Array<{ role: 'user'; content: string }>;
}

export const MAX_TOKENS: Record<QueryMode, number> = {
  quick: 200,
  deep: 600,
  links: 400,
};

export function buildClaudeRequest(payload: QueryPayload): ClaudeRequest {
  return {
    model: CLAUDE_MODEL,
    max_tokens: MAX_TOKENS[payload.mode],
    stream: true,
    system: SYSTEM_PROMPTS[payload.mode],
    messages: [
      {
        role: 'user',
        content: buildUserMessage(payload.context),
      },
    ],
  };
}

export type TokenRelay = (msg: {
  type: typeof MESSAGE.TOKEN;
  queryId: string;
  token?: string;
  done?: boolean;
  error?: string;
  retryAfterMs?: number;
}) => void;

export async function streamClaudeResponse(
  apiKey: string,
  payload: QueryPayload,
  signal: AbortSignal,
  relay: TokenRelay,
  isStale: () => boolean,
): Promise<void> {
  const queryId = payload.queryId;
  const request = buildClaudeRequest(payload);

  let response: Response;
  try {
    response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(request),
      signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') return;
    if (!isStale()) {
      relay({
        type: MESSAGE.TOKEN,
        queryId,
        error: ERROR_CODE.NETWORK_ERROR,
        done: true,
      });
    }
    return;
  }

  if (!response.ok) {
    if (isStale()) return;
    let errorType: string | undefined;
    try {
      const body = (await response.json()) as { error?: { type?: string } };
      errorType = body.error?.type;
    } catch {
      /* ignore */
    }
    const code = mapHttpError(response.status, errorType);
    relay({
      type: MESSAGE.TOKEN,
      queryId,
      error: code,
      retryAfterMs:
        code === ERROR_CODE.RATE_LIMIT
          ? parseRetryAfter(response.headers.get('Retry-After'))
          : undefined,
      done: true,
    });
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    if (!isStale()) {
      relay({
        type: MESSAGE.TOKEN,
        queryId,
        error: ERROR_CODE.NETWORK_ERROR,
        done: true,
      });
    }
    return;
  }

  const decoder = new TextDecoder();
  const parser = createSSEParser({
    onTextDelta(text) {
      if (isStale() || signal.aborted) return;
      relay({ type: MESSAGE.TOKEN, queryId, token: text });
    },
    onDone() {
      if (isStale() || signal.aborted) return;
      relay({ type: MESSAGE.TOKEN, queryId, done: true });
    },
  });

  try {
    while (true) {
      if (signal.aborted || isStale()) {
        await reader.cancel().catch(() => undefined);
        return;
      }
      const { done, value } = await reader.read();
      if (done) break;
      parser.feed(decoder.decode(value, { stream: true }));
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') return;
    if (!isStale()) {
      relay({
        type: MESSAGE.TOKEN,
        queryId,
        error: ERROR_CODE.NETWORK_ERROR,
        done: true,
      });
    }
  }
}
