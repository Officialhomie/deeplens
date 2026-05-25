import type { QueryMode } from '../shared/types';

/** F-13 — session mode memory (in-memory only, not persisted) */
let lastMode: QueryMode | null = null;

export function getSessionMode(): QueryMode | null {
  return lastMode;
}

export function setSessionMode(mode: QueryMode): void {
  lastMode = mode;
}

export function resetSessionModeForTests(): void {
  lastMode = null;
}
