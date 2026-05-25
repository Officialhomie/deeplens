import { describe, expect, it } from 'vitest';
import {
  isTrustedExtensionSender,
  isTrustedTabSender,
} from '../../src/background/trust';

describe('message sender trust', () => {
  it('accepts messages from this extension', () => {
    const sender = { id: chrome.runtime.id } as chrome.runtime.MessageSender;
    expect(isTrustedExtensionSender(sender)).toBe(true);
  });

  it('rejects foreign extension senders', () => {
    const sender = { id: 'other-extension' } as chrome.runtime.MessageSender;
    expect(isTrustedExtensionSender(sender)).toBe(false);
  });

  it('requires http(s) tab URL for query senders', () => {
    const ok = {
      id: chrome.runtime.id,
      tab: { id: 1, url: 'https://example.com' },
    } as chrome.runtime.MessageSender;
    expect(isTrustedTabSender(ok)).toBe(true);

    const fileTab = {
      id: chrome.runtime.id,
      tab: { id: 2, url: 'file:///secret' },
    } as chrome.runtime.MessageSender;
    expect(isTrustedTabSender(fileTab)).toBe(false);

    const noTab = { id: chrome.runtime.id } as chrome.runtime.MessageSender;
    expect(isTrustedTabSender(noTab)).toBe(false);
  });
});
