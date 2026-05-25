import { describe, expect, it } from 'vitest';
import { storage } from '../../src/shared/storage';

describe('storage', () => {
  it('returns defaults for missing keys', async () => {
    expect(await storage.get('hoverDelayMs')).toBe(300);
    expect(await storage.get('defaultMode')).toBe('deep');
    expect(await storage.get('apiKey')).toBe('');
  });

  it('persists values', async () => {
    await storage.set('hoverDelayMs', 500);
    expect(await storage.get('hoverDelayMs')).toBe(500);
  });

  it('merges getAll with defaults', async () => {
    await storage.set('isEnabled', false);
    const all = await storage.getAll();
    expect(all.isEnabled).toBe(false);
    expect(all.hoverDelayMs).toBe(300);
  });

  it('getPublicSettings omits apiKey', async () => {
    await storage.set('apiKey', 'sk-secret');
    await storage.set('hoverDelayMs', 400);
    const pub = await storage.getPublicSettings();
    expect('apiKey' in pub).toBe(false);
    expect(pub.hoverDelayMs).toBe(400);
  });
});
