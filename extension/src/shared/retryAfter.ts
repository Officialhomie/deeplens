/** Parse HTTP Retry-After (seconds or HTTP-date) to milliseconds */
export function parseRetryAfter(header: string | null): number | undefined {
  if (!header?.trim()) return undefined;
  const trimmed = header.trim();
  const seconds = Number(trimmed);
  if (!Number.isNaN(seconds) && seconds >= 0) {
    return Math.round(seconds * 1000);
  }
  const dateMs = Date.parse(trimmed);
  if (!Number.isNaN(dateMs)) {
    return Math.max(0, dateMs - Date.now());
  }
  return undefined;
}
