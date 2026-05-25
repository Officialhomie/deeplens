import { describe, expect, it } from 'vitest';
import { ERROR_CODE } from '../../src/shared/errors';

/** Maps error codes to expected user-facing recovery (TRD §10.2) */
const RECOVERY: Record<string, { hasAction: boolean; retryable: boolean }> = {
  [ERROR_CODE.NO_API_KEY]: { hasAction: true, retryable: false },
  [ERROR_CODE.INVALID_KEY]: { hasAction: true, retryable: false },
  [ERROR_CODE.RATE_LIMIT]: { hasAction: false, retryable: false },
  [ERROR_CODE.SESSION_RATE_LIMIT]: { hasAction: false, retryable: false },
  [ERROR_CODE.API_OVERLOADED]: { hasAction: true, retryable: true },
  [ERROR_CODE.NETWORK_ERROR]: { hasAction: true, retryable: true },
  [ERROR_CODE.CONNECTION_LOST]: { hasAction: true, retryable: true },
  [ERROR_CODE.BAD_REQUEST]: { hasAction: true, retryable: true },
  [ERROR_CODE.API_ERROR]: { hasAction: true, retryable: true },
};

describe('error recovery matrix', () => {
  it('covers all client error codes', () => {
    for (const code of Object.values(ERROR_CODE)) {
      if (code === ERROR_CODE.ABORTED) continue;
      expect(RECOVERY[code]).toBeDefined();
    }
  });
});
