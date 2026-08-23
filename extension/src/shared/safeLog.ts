/**
 * Key shapes for every supported provider. Anthropic-only redaction would leak
 * Gemini / Groq / OpenRouter keys verbatim into debug output.
 * `sk-or-` is listed before `sk-ant` only for readability; the alternation is
 * anchored on distinct prefixes so ordering does not affect matching.
 */
const SECRET_PATTERNS: Array<[RegExp, string]> = [
  [/sk-ant[A-Za-z0-9_-]+/g, 'sk-ant…[REDACTED]'],
  [/sk-or-[A-Za-z0-9_-]+/g, 'sk-or-…[REDACTED]'],
  [/gsk_[A-Za-z0-9_-]+/g, 'gsk_…[REDACTED]'],
  [/AIza[A-Za-z0-9_-]{10,}/g, 'AIza…[REDACTED]'],
];

/** Redact secrets before any debug logging */
export function redactSecrets(text: string): string {
  return SECRET_PATTERNS.reduce(
    (acc, [pattern, replacement]) => acc.replace(pattern, replacement),
    text,
  );
}

export function safeDebug(label: string, data?: unknown): void {
  if (!import.meta.env.DEV) return;
  if (data === undefined) {
    console.debug(`[DeepLens] ${label}`);
    return;
  }
  try {
    const serialized =
      typeof data === 'string' ? data : JSON.stringify(data);
    console.debug(`[DeepLens] ${label}`, redactSecrets(serialized));
  } catch {
    console.debug(`[DeepLens] ${label}`);
  }
}
