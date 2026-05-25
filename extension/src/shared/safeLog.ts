const SECRET_PATTERN = /sk-ant[a-z0-9_-]+/gi;

/** Redact secrets before any debug logging */
export function redactSecrets(text: string): string {
  return text.replace(SECRET_PATTERN, 'sk-ant…[REDACTED]');
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
