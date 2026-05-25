import { describe, expect, it } from 'vitest';
import { redactSecrets } from '../../src/shared/safeLog';

describe('safeLog', () => {
  it('redacts Anthropic-style keys in strings', () => {
    const input = 'key=sk-ant-api03-abcdefghijklmnopqrstuvwxyz end';
    expect(redactSecrets(input)).toContain('[REDACTED]');
    expect(redactSecrets(input)).not.toContain('sk-ant-api03-abcdefghijklmnopqrstuvwxyz');
  });
});
