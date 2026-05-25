/** Client-safe error codes (TRD §5.3, §10) */
export const ERROR_CODE = {
  NO_API_KEY: 'NO_API_KEY',
  INVALID_KEY: 'INVALID_KEY',
  RATE_LIMIT: 'RATE_LIMIT',
  SESSION_RATE_LIMIT: 'SESSION_RATE_LIMIT',
  API_OVERLOADED: 'API_OVERLOADED',
  BAD_REQUEST: 'BAD_REQUEST',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  CONNECTION_LOST: 'CONNECTION_LOST',
  ABORTED: 'ABORTED',
} as const;

/** Default auto-retry delay for API_OVERLOADED (TRD §10.2) */
export const API_OVERLOADED_RETRY_MS = 3000;

/** Stream idle watchdog — no tokens before treating as disconnected */
export const STREAM_IDLE_TIMEOUT_MS = 45_000;

export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];

export function mapHttpError(status: number, errorType?: string): ErrorCode {
  if (status === 401 || status === 403) {
    // Anthropic uses 'authentication_error'; other providers just use 401/403
    return errorType === 'authentication_error' || !errorType
      ? ERROR_CODE.INVALID_KEY
      : ERROR_CODE.NO_API_KEY;
  }
  if (status === 402) return ERROR_CODE.INVALID_KEY; // out of credits
  if (status === 400 || status === 404 || status === 422) return ERROR_CODE.BAD_REQUEST;
  if (status === 429) return ERROR_CODE.RATE_LIMIT;
  if (status === 503 || status === 529) return ERROR_CODE.API_OVERLOADED;
  return ERROR_CODE.API_ERROR;
}
