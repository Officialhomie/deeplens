let sessionId: string = crypto.randomUUID();

export function getSessionId(): string {
  return sessionId;
}

/** For tests only */
export function resetSessionId(id?: string): void {
  sessionId = id ?? crypto.randomUUID();
}
