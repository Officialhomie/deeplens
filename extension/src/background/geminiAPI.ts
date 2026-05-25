/** Google Gemini streaming API handler */
import { buildUserMessage, SYSTEM_PROMPTS } from './prompts';
import { ERROR_CODE, mapHttpError } from '../shared/errors';
import { parseRetryAfter } from '../shared/retryAfter';
import type { QueryMode, QueryPayload } from '../shared/types';
import { MESSAGE } from '../shared/types';
import type { TokenRelay } from './claudeAPI';

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export const GEMINI_MAX_TOKENS: Record<QueryMode, number> = {
  quick: 200,
  deep: 600,
  links: 400,
};

function buildGeminiRequest(payload: QueryPayload): object {
  return {
    system_instruction: {
      parts: [{ text: SYSTEM_PROMPTS[payload.mode] }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: buildUserMessage(payload.context) }],
      },
    ],
    generationConfig: {
      maxOutputTokens: GEMINI_MAX_TOKENS[payload.mode],
    },
  };
}

export async function streamGeminiResponse(
  apiKey: string,
  payload: QueryPayload,
  signal: AbortSignal,
  relay: TokenRelay,
  isStale: () => boolean,
): Promise<void> {
  const queryId = payload.queryId;
  const url = `${GEMINI_BASE_URL}/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildGeminiRequest(payload)),
      signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') return;
    if (!isStale()) {
      relay({ type: MESSAGE.TOKEN, queryId, error: ERROR_CODE.NETWORK_ERROR, done: true });
    }
    return;
  }

  if (!response.ok) {
    if (isStale()) return;
    const code = mapHttpError(response.status, undefined);
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
      relay({ type: MESSAGE.TOKEN, queryId, error: ERROR_CODE.NETWORK_ERROR, done: true });
    }
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let hasDone = false;

  const processLine = (line: string): void => {
    if (!line.startsWith('data: ')) return;
    const data = line.slice(6).trim();
    if (!data || data === '[DONE]') return;
    try {
      const parsed = JSON.parse(data) as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
          finishReason?: string;
        }>;
        error?: { message?: string; code?: number };
      };
      if (parsed.error) {
        if (!hasDone && !isStale()) {
          hasDone = true;
          const code = mapHttpError(parsed.error.code ?? 500, undefined);
          relay({ type: MESSAGE.TOKEN, queryId, error: code, done: true });
        }
        return;
      }
      const candidate = parsed.candidates?.[0];
      if (!candidate) return;
      const text = candidate.content?.parts?.[0]?.text;
      if (text && !isStale() && !signal.aborted) {
        relay({ type: MESSAGE.TOKEN, queryId, token: text });
      }
      if (candidate.finishReason && !hasDone && !isStale() && !signal.aborted) {
        hasDone = true;
        relay({ type: MESSAGE.TOKEN, queryId, done: true });
      }
    } catch {
      /* skip malformed */
    }
  };

  try {
    while (true) {
      if (signal.aborted || isStale()) {
        await reader.cancel().catch(() => undefined);
        return;
      }
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split('\n\n');
      buffer = blocks.pop() ?? '';
      for (const block of blocks) {
        for (const line of block.split('\n')) {
          processLine(line);
        }
      }
    }
    if (!hasDone && !isStale() && !signal.aborted) {
      relay({ type: MESSAGE.TOKEN, queryId, done: true });
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') return;
    if (!isStale()) {
      relay({ type: MESSAGE.TOKEN, queryId, error: ERROR_CODE.NETWORK_ERROR, done: true });
    }
  }
}
