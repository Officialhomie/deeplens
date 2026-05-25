import { buildUserMessage, SYSTEM_PROMPTS } from './prompts';
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
  token?: string;
  done?: boolean;
  error?: string;
}) => void;

function mapHttpError(status: number, errorType?: string): string {
  if (status === 401) return errorType === 'authentication_error' ? 'INVALID_KEY' : 'NO_API_KEY';
  if (status === 429) return 'RATE_LIMIT';
  if (status === 529) return 'API_OVERLOADED';
  if (status === 400) return 'BAD_REQUEST';
  return 'API_ERROR';
}

/**
 * Stream Anthropic SSE and relay tokens to the content script (TRD §4.5–4.6).
 */
export async function streamClaudeResponse(
  apiKey: string,
  payload: QueryPayload,
  signal: AbortSignal,
  relay: TokenRelay,
): Promise<void> {
  const request = buildClaudeRequest(payload);

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    let errorType: string | undefined;
    try {
      const body = (await response.json()) as { error?: { type?: string } };
      errorType = body.error?.type;
    } catch {
      /* ignore parse errors */
    }
    relay({
      type: MESSAGE.TOKEN,
      error: mapHttpError(response.status, errorType),
      done: true,
    });
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    relay({ type: MESSAGE.TOKEN, error: 'NETWORK_ERROR', done: true });
    return;
  }

  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

      for (const line of lines) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          relay({ type: MESSAGE.TOKEN, done: true });
          return;
        }
        try {
          const parsed = JSON.parse(data) as {
            type?: string;
            delta?: { text?: string };
          };
          const token = parsed.delta?.text;
          if (token) {
            relay({ type: MESSAGE.TOKEN, token });
          }
          if (parsed.type === 'message_stop') {
            relay({ type: MESSAGE.TOKEN, done: true });
            return;
          }
        } catch {
          /* skip malformed SSE line */
        }
      }
    }
    relay({ type: MESSAGE.TOKEN, done: true });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') return;
    relay({ type: MESSAGE.TOKEN, error: 'NETWORK_ERROR', done: true });
  }
}
