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
  openrouter: 'nvidia/nemotron-3-nano-30b-a3b:free',
};

/** Try less-saturated free models before surfacing RATE_LIMIT (404/429 rotate). */
const OPENROUTER_FREE_MODELS = [
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'deepseek/deepseek-v4-flash:free',
  'openai/gpt-oss-20b:free',
] as const;

type OpenRouterFreeModel = (typeof OPENROUTER_FREE_MODELS)[number];

export const OPENAI_COMPAT_MAX_TOKENS: Record<QueryMode, number> = {
  quick: 200,
  deep: 600,
  links: 400,
};

type StreamDelta = {
  content?: string | null;
  text?: string | null;
  reasoning?: string | null;
  reasoning_content?: string | null;
};

/** Pull user-visible text from OpenAI-style stream deltas (provider-specific fields). */
export function extractStreamDeltaText(delta: StreamDelta | undefined): string {
  if (!delta) return '';
  if (typeof delta.content === 'string' && delta.content.length > 0) {
    return delta.content;
  }
  if (typeof delta.text === 'string' && delta.text.length > 0) {
    return delta.text;
  }
  return '';
}

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
      error?: { type?: string; code?: string | number; message?: string };
    };
    safeDebug('openai-compat error body', body);
    const code = body.error?.code;
    return body.error?.type ?? (code !== undefined ? String(code) : undefined);
  } catch {
    return undefined;
  }
}

/** Retry-After header or OpenRouter metadata.retry_after(_ms). */
export async function parseRateLimitDelayMs(
  response: Response,
): Promise<number | undefined> {
  const headerMs = parseRetryAfter(response.headers.get('Retry-After'));
  if (headerMs !== undefined) return headerMs;
  try {
    const body = (await response.clone().json()) as {
      error?: {
        metadata?: { retry_after?: number; retry_after_ms?: number };
      };
    };
    const meta = body.error?.metadata;
    if (typeof meta?.retry_after_ms === 'number') return meta.retry_after_ms;
    if (typeof meta?.retry_after === 'number') {
      return Math.round(meta.retry_after * 1000);
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

async function fetchOpenRouterWithFallback(
  apiKey: string,
  payload: QueryPayload,
  signal: AbortSignal,
  extraHeaders: Record<string, string>,
): Promise<{ response: Response; model: string; rateLimitMs?: number }> {
  let lastResponse: Response | null = null;
  let lastModel: OpenRouterFreeModel = OPENROUTER_FREE_MODELS[0];
  let bestRateLimitMs: number | undefined;

  for (let i = 0; i < OPENROUTER_FREE_MODELS.length; i++) {
    const model = OPENROUTER_FREE_MODELS[i];
    lastModel = model;

    const response = await fetch(PROVIDER_URLS.openrouter, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...extraHeaders,
      },
      body: JSON.stringify(buildRequest(payload, model)),
      signal,
    });
    lastResponse = response;

    if (response.ok) {
      return { response, model };
    }

    if (response.status === 429) {
      const delay = await parseRateLimitDelayMs(response);
      if (delay !== undefined) {
        bestRateLimitMs =
          bestRateLimitMs === undefined
            ? delay
            : Math.max(bestRateLimitMs, delay);
      }
      if (i < OPENROUTER_FREE_MODELS.length - 1) continue;
    }

    if (response.status === 404 && i < OPENROUTER_FREE_MODELS.length - 1) {
      continue;
    }

    return { response, model, rateLimitMs: bestRateLimitMs };
  }

  return {
    response: lastResponse!,
    model: lastModel,
    rateLimitMs: bestRateLimitMs,
  };
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

  const extraHeaders: Record<string, string> =
    provider === 'openrouter'
      ? { 'HTTP-Referer': 'https://deeplens.app', 'X-Title': 'DeepLens' }
      : {};

  let response: Response;
  let model = PROVIDER_MODELS[provider];
  let openRouterRateLimitMs: number | undefined;

  try {
    if (provider === 'openrouter') {
      const result = await fetchOpenRouterWithFallback(
        apiKey,
        payload,
        signal,
        extraHeaders,
      );
      response = result.response;
      model = result.model;
      openRouterRateLimitMs = result.rateLimitMs;
    } else {
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
    }
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
    const retryAfterMs =
      code === ERROR_CODE.RATE_LIMIT
        ? (openRouterRateLimitMs ??
          (await parseRateLimitDelayMs(response)))
        : undefined;
    safeDebug(`${provider} HTTP ${response.status}`, { errorType, code });
    relay({
      type: MESSAGE.TOKEN,
      queryId,
      error: code,
      retryAfterMs,
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
  let hasStreamedContent = false;

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
        choices?: Array<{
          delta?: StreamDelta;
          message?: { content?: string | null };
          finish_reason?: string | null;
        }>;
        error?: { message?: string; type?: string };
      };
      if (parsed.error && !hasDone && !isStale()) {
        hasDone = true;
        const code = mapHttpError(500, parsed.error.type);
        relay({ type: MESSAGE.TOKEN, queryId, error: code, done: true });
        return;
      }
      const choice = parsed.choices?.[0];
      if (!choice) return;
      const text =
        extractStreamDeltaText(choice.delta) ||
        (typeof choice.message?.content === 'string'
          ? choice.message.content
          : '');
      if (text && !isStale() && !signal.aborted) {
        hasStreamedContent = true;
        relay({ type: MESSAGE.TOKEN, queryId, token: text });
      }
      if (choice.finish_reason && !hasDone && !isStale() && !signal.aborted) {
        hasDone = true;
        if (!hasStreamedContent) {
          relay({
            type: MESSAGE.TOKEN,
            queryId,
            error: ERROR_CODE.API_ERROR,
            done: true,
          });
        } else {
          relay({ type: MESSAGE.TOKEN, queryId, done: true });
        }
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
      if (!hasStreamedContent) {
        relay({
          type: MESSAGE.TOKEN,
          queryId,
          error: ERROR_CODE.API_ERROR,
          done: true,
        });
      } else {
        relay({ type: MESSAGE.TOKEN, queryId, done: true });
      }
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') return;
    if (!isStale()) {
      relay({ type: MESSAGE.TOKEN, queryId, error: ERROR_CODE.NETWORK_ERROR, done: true });
    }
  }
}
