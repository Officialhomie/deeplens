/** Client-side session guard (TRD §9.3) — 30 queries / 10 minutes */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_QUERIES = 30;

let timestamps: number[] = [];

export function resetRateLimiterForTests(): void {
  timestamps = [];
}

export function checkSessionRateLimit(): boolean {
  const now = Date.now();
  timestamps = timestamps.filter((t) => now - t < WINDOW_MS);
  if (timestamps.length >= MAX_QUERIES) return false;
  timestamps.push(now);
  return true;
}

export function sessionQueryCount(): number {
  const now = Date.now();
  return timestamps.filter((t) => now - t < WINDOW_MS).length;
}
