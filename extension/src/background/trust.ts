/** Message sender trust boundaries (Phase 7) */

export function isTrustedExtensionSender(
  sender: chrome.runtime.MessageSender,
): boolean {
  return sender.id === chrome.runtime.id;
}

export function isTrustedTabSender(
  sender: chrome.runtime.MessageSender,
): boolean {
  if (!isTrustedExtensionSender(sender)) return false;
  const tabId = sender.tab?.id;
  if (tabId === undefined) return false;
  const url = sender.tab?.url ?? sender.url ?? '';
  return url.startsWith('http://') || url.startsWith('https://');
}
