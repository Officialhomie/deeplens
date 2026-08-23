/**
 * The background must not attempt a provider fetch without the matching
 * optional host permission. Without this gate a revoked grant surfaces as an
 * opaque CORS/network failure instead of an actionable "grant access" prompt.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ERROR_CODE } from '../../src/shared/errors';
import { MESSAGE } from '../../src/shared/types';
import type { QueryPayload } from '../../src/shared/types';

function payload(): QueryPayload {
  return {
    mode: 'quick',
    triggeredBy: 'hover',
    sessionId: 'session-1',
    queryId: 'query-1',
    context: {
      selectedText: 'eigenvalue',
      sentenceContext: 'An eigenvalue is a scalar.',
      paragraphContext: 'Linear algebra basics.',
      headingContext: 'Intro',
      pageTitle: 'Example',
      pageURL: 'https://example.com/a',
      pageDomain: 'example.com',
      domainCategory: 'technical',
    },
  };
}

/** Install a chrome stub whose permissions.contains resolves to `granted`. */
function stubChrome(granted: boolean, sent: unknown[]) {
  vi.stubGlobal('chrome', {
    runtime: { id: 'test-ext', onMessage: { addListener: vi.fn() }, lastError: null },
    storage: {
      local: {
        get: vi.fn((key: string | null) =>
          Promise.resolve(
            key === null
              ? { provider: 'anthropic', apiKey: 'sk-ant-api03-valid-looking-key-value' }
              : key === 'provider'
                ? { provider: 'anthropic' }
                : { apiKey: 'sk-ant-api03-valid-looking-key-value' },
          ),
        ),
        set: vi.fn(() => Promise.resolve()),
      },
      onChanged: { addListener: vi.fn() },
    },
    permissions: { contains: vi.fn(() => Promise.resolve(granted)) },
    tabs: {
      sendMessage: vi.fn((_tabId: number, msg: unknown) => {
        sent.push(msg);
        return Promise.resolve();
      }),
    },
  });
}

describe('provider host permission gate', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it('emits MISSING_HOST_PERMISSION and makes no fetch when the grant is absent', async () => {
    const sent: unknown[] = [];
    stubChrome(false, sent);
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const { handleQueryForTests } = await import('../../src/background/messageRouter');
    await handleQueryForTests(payload(), 1);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(sent).toContainEqual(
      expect.objectContaining({
        type: MESSAGE.TOKEN,
        queryId: 'query-1',
        error: ERROR_CODE.MISSING_HOST_PERMISSION,
        done: true,
      }),
    );
  });

  it('proceeds to the provider call once the grant is present', async () => {
    const sent: unknown[] = [];
    stubChrome(true, sent);
    // Fail the fetch fast — this test only asserts the gate was passed.
    const fetchSpy = vi.fn(() => Promise.reject(new Error('network stub')));
    vi.stubGlobal('fetch', fetchSpy);

    const { handleQueryForTests } = await import('../../src/background/messageRouter');
    await handleQueryForTests(payload(), 1);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const errors = sent.map((m) => (m as { error?: string }).error);
    expect(errors).not.toContain(ERROR_CODE.MISSING_HOST_PERMISSION);
  });
});
