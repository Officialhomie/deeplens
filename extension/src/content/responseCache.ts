import type { QueryMode } from '../shared/types';

/** TRD §9.3 — skip re-query for same word within 1s of completed response */
export const RESPONSE_CACHE_TTL_MS = 1000;

export interface CachedResponse {
  word: string;
  mode: QueryMode;
  pageDomain: string;
  streamBuffer: string;
  completedAt: number;
}

let entry: CachedResponse | null = null;

export function getCachedResponse(
  word: string,
  mode: QueryMode,
  pageDomain: string,
): CachedResponse | null {
  if (!entry) return null;
  if (Date.now() - entry.completedAt > RESPONSE_CACHE_TTL_MS) return null;
  if (
    entry.word !== word ||
    entry.mode !== mode ||
    entry.pageDomain !== pageDomain
  ) {
    return null;
  }
  return entry;
}

export function setCachedResponse(
  word: string,
  mode: QueryMode,
  pageDomain: string,
  streamBuffer: string,
): void {
  entry = {
    word,
    mode,
    pageDomain,
    streamBuffer,
    completedAt: Date.now(),
  };
}

export function clearResponseCache(): void {
  entry = null;
}

export function resetResponseCacheForTests(): void {
  entry = null;
}
