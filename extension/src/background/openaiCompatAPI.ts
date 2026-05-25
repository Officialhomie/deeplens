/** OpenAI-compatible streaming API handler (Groq, OpenRouter) */
import { buildUserMessage, SYSTEM_PROMPTS } from './prompts';
import { ERROR_CODE, mapHttpError } from '../shared/errors';
import { parseRetryAfter } from '../shared/retryAfter';
import { safeDebug } from '../shared/safeLog';
import type { LLMProvider, QueryMode, QueryPayload } from '../shared/types';
import { MESSAGE } from '../shared/types';
import type { TokenRelay } from './claudeAPI';

const PROVIDER_URLS: Record<'groq' | 'openrouter', string> = {
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
};

const PROVIDER_MODELS: Record<'groq' | 'openrouter', string> = {
  groq: 'llama-3.3-70b-versatile',
  openrouter: 'meta-llama/llama-3.3-70b-instruct:free',
};

export const OPENAI_COMPAT_MAX_TOKENS: Record<QueryMode, number> = {
  quick: 200,
  deep: 600,
  links: 400,
};

function buildRequest(payload: QueryPayload, model: string): object {
  return {
    model,
    max_tokens: OPENAI_COMPAT_MAX_TOKENS[payload.mode],
    stream: true,
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS[payload.mode] },
      { role: 'user', content: buildUserMessage(payload.context) },
    ],
  };
}

/** Extract error type string from a provider's JSON error body (best-effort). */
async function extractErrorType(response: Response): Promise<string | undefined> {
  try {
    const body = (await response.clone().json()) as {
      error?: { type?: string; code?: string; message?: string };
    };
    safeDebug('openai-compat error body', body);
    return body.error?.type ?? body.error?.code;
  } catch {
    return undefined;
  }
}

export async function streamOpenAICompatResponse(
  apiKey: string,
  provider: Extract<LLMProvider, 'groq' | 'openrouter'>,
  payload: QueryPayload,
  signal: AbortSignal,
  relay: TokenRelay,
  isStale: () => boolean,
): Promise<void> {
  const queryId = payload.queryId;
  const url = PROVIDER_URLS[provider];
  const model = PROVIDER_MODELS[provider];

  const extraHeaders: Record<string, string> =
    provider === 'openrouter'
      ? { 'HTTP-Referer': 'https://deeplens.app', 'X-Title': 'DeepLens' }
      : {};

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...extraHeaders,
      },
      body: JSON.stringify(buildRequest(payload, model)),
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
    const errorType = await extractErrorType(response);
    const code = mapHttpError(response.status, errorType);
    safeDebug(`${provider} HTTP ${response.status}`, { errorType, code });
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
    if (!data) return;
    if (data === '[DONE]') {
      if (!hasDone && !isStale() && !signal.aborted) {
        hasDone = true;
        relay({ type: MESSAGE.TOKEN, queryId, done: true });
      }
      return;
    }
    try {
      const parsed = JSON.parse(data) as {
        choices?: Array<{ delta?: { content?: string }; finish_reason?: string | null }>;
        error?: { message?: string; type?: string };
      };
      // Some providers return an error object inside a 200 SSE stream
      if (parsed.error && !hasDone && !isStale()) {
        hasDone = true;
        const code = mapHttpError(500, parsed.error.type);
        relay({ type: MESSAGE.TOKEN, queryId, error: code, done: true });
        return;
      }
      const choice = parsed.choices?.[0];
      if (!choice) return;
      const text = choice.delta?.content;
      if (text && !isStale() && !signal.aborted) {
        relay({ type: MESSAGE.TOKEN, queryId, token: text });
      }
      if (choice.finish_reason && !hasDone && !isStale() && !signal.aborted) {
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
    // Stream ended without a [DONE] marker — relay done anyway
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
