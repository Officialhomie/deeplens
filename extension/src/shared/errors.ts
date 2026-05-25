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
  ABORTED: 'ABORTED',
} as const;

export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];

export function mapHttpError(status: number, errorType?: string): ErrorCode {
  if (status === 401) {
    return errorType === 'authentication_error'
      ? ERROR_CODE.INVALID_KEY
      : ERROR_CODE.NO_API_KEY;
  }
  if (status === 429) return ERROR_CODE.RATE_LIMIT;
  if (status === 529) return ERROR_CODE.API_OVERLOADED;
  if (status === 400) return ERROR_CODE.BAD_REQUEST;
  return ERROR_CODE.API_ERROR;
}
